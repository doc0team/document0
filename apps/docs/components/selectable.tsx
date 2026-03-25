"use client";

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
  type PointerEvent as RPointerEvent,
} from "react";
import { playPop, playResizeTick, resetTickStep } from "./pop-sound";

const LIFT_SCALE_REST = 1.0;
const LIFT_SCALE_TARGET = 1.08;
const MAX_TILT = 16;

const TILT_STIFFNESS = 0.14;
const TILT_DAMPING = 0.68;
const LIFT_STIFFNESS = 0.18;
const LIFT_DAMPING = 0.55;
const VELOCITY_SENSITIVITY = 0.7;

const RETURN_STIFFNESS = 0.08;
const RETURN_DAMPING = 0.75;

interface SelectableProps {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
  className?: string;
  inline?: boolean;
  resetTrigger?: number;
  onDirtyChange?: (dirty: boolean) => void;
}

export function Selectable({
  selected,
  onSelect,
  children,
  className = "",
  inline = false,
  resetTrigger = 0,
  onDirtyChange,
}: SelectableProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [liftScale, setLiftScale] = useState(1);
  const [hop, setHop] = useState(0);

  const dirtyRef = useRef(false);
  const onDirtyChangeRef = useRef(onDirtyChange);
  onDirtyChangeRef.current = onDirtyChange;

  const markDirty = useCallback((d: boolean) => {
    if (dirtyRef.current !== d) {
      dirtyRef.current = d;
      onDirtyChangeRef.current?.(d);
    }
  }, []);

  const springRef = useRef({
    rx: 0, ry: 0,
    vrx: 0, vry: 0,
    targetRx: 0, targetRy: 0,
    lift: 1, vLift: 0, targetLift: 1,
    hopY: 0, vHop: 0, targetHop: 0,
    active: false,
    // Return-to-origin spring
    px: 0, py: 0, vpx: 0, vpy: 0, targetPx: 0, targetPy: 0,
    sc: 1, vsc: 0, targetSc: 1,
    returning: false,
  });
  const rafRef = useRef<number>(0);

  const tickSpring = useCallback(() => {
    const s = springRef.current;

    s.vrx = (s.vrx + (s.targetRx - s.rx) * TILT_STIFFNESS) * TILT_DAMPING;
    s.vry = (s.vry + (s.targetRy - s.ry) * TILT_STIFFNESS) * TILT_DAMPING;
    s.rx = Math.max(-MAX_TILT, Math.min(MAX_TILT, s.rx + s.vrx));
    s.ry = Math.max(-MAX_TILT, Math.min(MAX_TILT, s.ry + s.vry));

    s.vLift = (s.vLift + (s.targetLift - s.lift) * LIFT_STIFFNESS) * LIFT_DAMPING;
    s.lift += s.vLift;

    s.vHop = (s.vHop + (s.targetHop - s.hopY) * LIFT_STIFFNESS) * LIFT_DAMPING;
    s.hopY += s.vHop;

    if (s.returning) {
      s.vpx = (s.vpx + (s.targetPx - s.px) * RETURN_STIFFNESS) * RETURN_DAMPING;
      s.vpy = (s.vpy + (s.targetPy - s.py) * RETURN_STIFFNESS) * RETURN_DAMPING;
      s.vsc = (s.vsc + (s.targetSc - s.sc) * RETURN_STIFFNESS) * RETURN_DAMPING;
      s.px += s.vpx;
      s.py += s.vpy;
      s.sc += s.vsc;
      setPos({ x: s.px, y: s.py });
      setScale(s.sc);
    }

    setTilt({ rx: s.rx, ry: s.ry });
    setLiftScale(s.lift);
    setHop(s.hopY);

    const tiltSettled =
      Math.abs(s.vrx) < 0.005 && Math.abs(s.vry) < 0.005 &&
      Math.abs(s.rx) < 0.005 && Math.abs(s.ry) < 0.005;
    const liftSettled =
      Math.abs(s.vLift) < 0.001 && Math.abs(s.lift - s.targetLift) < 0.001;
    const hopSettled =
      Math.abs(s.vHop) < 0.01 && Math.abs(s.hopY - s.targetHop) < 0.01;
    const returnSettled = !s.returning || (
      Math.abs(s.vpx) < 0.05 && Math.abs(s.vpy) < 0.05 &&
      Math.abs(s.px) < 0.05 && Math.abs(s.py) < 0.05 &&
      Math.abs(s.vsc) < 0.001 && Math.abs(s.sc - 1) < 0.001
    );

    const allSettled = !s.active && tiltSettled && liftSettled && hopSettled && returnSettled;

    if (allSettled) {
      s.rx = 0; s.ry = 0;
      s.lift = LIFT_SCALE_REST; s.hopY = 0;
      setTilt({ rx: 0, ry: 0 });
      setLiftScale(LIFT_SCALE_REST);
      setHop(0);
      if (s.returning) {
        s.px = 0; s.py = 0; s.sc = 1;
        s.returning = false;
        setPos({ x: 0, y: 0 });
        setScale(1);
        markDirty(false);
      }
      return;
    }
    rafRef.current = requestAnimationFrame(tickSpring);
  }, [markDirty]);

  const startSpring = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const s = springRef.current;
    s.active = true;
    s.returning = false;
    s.targetLift = LIFT_SCALE_TARGET;
    s.vLift = 0.06;
    s.targetHop = -6;
    s.vHop = -0.8;
    rafRef.current = requestAnimationFrame(tickSpring);
  }, [tickSpring]);

  const stopSpring = useCallback(() => {
    const s = springRef.current;
    s.active = false;
    s.targetRx = 0;
    s.targetRy = 0;
    s.targetLift = LIFT_SCALE_REST;
    s.targetHop = 0;
    s.vLift = -0.02;
  }, []);

  const triggerReturn = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const s = springRef.current;
    s.px = pos.x; s.py = pos.y; s.sc = scale;
    s.vpx = 0; s.vpy = 0; s.vsc = 0;
    s.targetPx = 0; s.targetPy = 0; s.targetSc = 1;
    s.returning = true;
    s.active = false;
    s.targetRx = 0; s.targetRy = 0;
    s.targetLift = LIFT_SCALE_REST;
    s.targetHop = 0;
    rafRef.current = requestAnimationFrame(tickSpring);
  }, [pos.x, pos.y, scale, tickSpring]);

  const prevResetTrigger = useRef(resetTrigger);
  useEffect(() => {
    if (resetTrigger !== prevResetTrigger.current) {
      prevResetTrigger.current = resetTrigger;
      if (dirtyRef.current) {
        triggerReturn();
      }
    }
  }, [resetTrigger, triggerReturn]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const dragRef = useRef<{
    type: "move" | "resize";
    sx: number; sy: number;
    ox: number; oy: number;
    os: number; corner: string;
    lastX: number; lastY: number;
  } | null>(null);

  const onBody = useCallback(
    (e: RPointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (!selected) onSelect();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        type: "move",
        sx: e.clientX, sy: e.clientY,
        ox: pos.x, oy: pos.y,
        os: scale, corner: "",
        lastX: e.clientX, lastY: e.clientY,
      };
      setDragging(true);
      playPop();
      startSpring();
    },
    [selected, onSelect, pos.x, pos.y, scale, startSpring]
  );

  const onCorner = useCallback(
    (corner: string) => (e: RPointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        type: "resize",
        sx: e.clientX, sy: e.clientY,
        ox: pos.x, oy: pos.y,
        os: scale, corner,
        lastX: e.clientX, lastY: e.clientY,
      };
      setDragging(true);
      playPop();
      startSpring();
    },
    [pos.x, pos.y, scale, startSpring]
  );

  const onMove = useCallback((e: RPointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;

    const vx = e.clientX - d.lastX;
    const vy = e.clientY - d.lastY;
    d.lastX = e.clientX;
    d.lastY = e.clientY;

    if (d.type === "move") {
      const newPos = { x: d.ox + dx, y: d.oy + dy };
      setPos(newPos);
      springRef.current.targetRy = vx * VELOCITY_SENSITIVITY;
      springRef.current.targetRx = -vy * VELOCITY_SENSITIVITY;
      if (Math.abs(newPos.x) > 2 || Math.abs(newPos.y) > 2) markDirty(true);
    } else {
      let delta: number;
      if (d.corner === "br") delta = dx + dy;
      else if (d.corner === "bl") delta = -dx + dy;
      else if (d.corner === "tr") delta = dx - dy;
      else delta = -dx - dy;
      const newScale = Math.max(0.3, Math.min(3, d.os + delta / 250));
      setScale(newScale);
      playResizeTick(newScale);
      if (Math.abs(newScale - 1) > 0.02) markDirty(true);
    }
  }, [markDirty]);

  const onUp = useCallback(() => {
    dragRef.current = null;
    setDragging(false);
    resetTickStep();
    stopSpring();
  }, [stopSpring]);

  const corners = [
    { k: "tl", t: true, l: true, c: "nwse-resize" },
    { k: "tr", t: true, l: false, c: "nesw-resize" },
    { k: "bl", t: false, l: true, c: "nesw-resize" },
    { k: "br", t: false, l: false, c: "nwse-resize" },
  ] as const;

  const stopClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const origin = inline ? "left center" : "center center";

  return (
    <div
      className={`relative ${inline ? "inline-block" : ""} ${selected ? "cursor-move z-10 select-none" : "cursor-pointer"} ${className}`}
      style={{
        transform: `translate(${pos.x}px, ${(pos.y + hop).toFixed(1)}px) scale(${(scale * liftScale).toFixed(4)})`,
        transformOrigin: origin,
        touchAction: selected ? "none" : undefined,
      }}
      onPointerDown={onBody}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onClick={stopClick}
    >
      <div style={{ perspective: "600px", transformOrigin: origin, display: "flex" }}>
        <div
          style={{
            transform: `rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg)`,
            transformOrigin: origin,
            transition: dragging ? "filter 0.15s ease" : "filter 0.3s ease",
            filter: dragging
              ? "drop-shadow(0 10px 20px rgba(0,0,0,0.35))"
              : "drop-shadow(0 0px 0px rgba(0,0,0,0))",
            willChange: dragging ? "transform, filter" : undefined,
          }}
        >
          {children}
        </div>
      </div>
      {selected && (
        <>
          <span
            className="absolute inset-[-6px] pointer-events-none z-20"
            style={{
              backgroundImage:
                "linear-gradient(90deg, #4ade80 50%, transparent 50%), linear-gradient(90deg, #4ade80 50%, transparent 50%), linear-gradient(0deg, #4ade80 50%, transparent 50%), linear-gradient(0deg, #4ade80 50%, transparent 50%)",
              backgroundSize: "8px 1px, 8px 1px, 1px 8px, 1px 8px",
              backgroundRepeat: "repeat-x, repeat-x, repeat-y, repeat-y",
              animation: "marching-ants 0.4s linear infinite",
            }}
          />
          {corners.map(({ k, t, l, c }) => (
            <span
              key={k}
              className="absolute h-[7px] w-[7px] border border-[#4ade80] bg-white z-30"
              style={{
                top: t ? "-9px" : undefined,
                bottom: !t ? "-9px" : undefined,
                left: l ? "-9px" : undefined,
                right: !l ? "-9px" : undefined,
                cursor: c,
                touchAction: "none",
              }}
              onPointerDown={onCorner(k)}
              onPointerMove={onMove}
              onPointerUp={onUp}
            />
          ))}
        </>
      )}
    </div>
  );
}
