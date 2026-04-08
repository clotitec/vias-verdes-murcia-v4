'use client';

import { useState, useRef, useCallback, type ReactNode } from 'react';

interface MobileBottomSheetProps {
  children: ReactNode;
}

const SNAP_COLLAPSED = 140;
const SNAP_HALF_RATIO = 0.45;
const SNAP_FULL_OFFSET = 60;

export default function MobileBottomSheet({ children }: MobileBottomSheetProps) {
  const [height, setHeight] = useState(SNAP_COLLAPSED);
  const dragRef = useRef({ startY: 0, startHeight: 0, dragging: false });

  const getSnapPoints = useCallback(() => {
    const h = window.innerHeight;
    return [SNAP_COLLAPSED, h * SNAP_HALF_RATIO, h - SNAP_FULL_OFFSET];
  }, []);

  const snapTo = useCallback(
    (y: number) => {
      const snaps = getSnapPoints();
      let closest = snaps[0];
      let minDist = Infinity;
      for (const s of snaps) {
        const dist = Math.abs(y - s);
        if (dist < minDist) {
          minDist = dist;
          closest = s;
        }
      }
      setHeight(closest);
    },
    [getSnapPoints]
  );

  const onTouchStart = (e: React.TouchEvent) => {
    dragRef.current = {
      startY: e.touches[0].clientY,
      startHeight: height,
      dragging: true,
    };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragRef.current.dragging) return;
    const delta = dragRef.current.startY - e.touches[0].clientY;
    const newHeight = Math.max(80, dragRef.current.startHeight + delta);
    setHeight(newHeight);
  };

  const onTouchEnd = () => {
    dragRef.current.dragging = false;
    snapTo(height);
  };

  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 transition-[height] duration-300 ease-out"
      style={{
        height,
        background: 'var(--bg-sidebar)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.1)',
      }}
    >
      {/* Drag handle */}
      <div
        className="flex justify-center py-2 cursor-grab active:cursor-grabbing"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="w-10 h-1 rounded-full bg-gray-300" />
      </div>

      {/* Content */}
      <div className="overflow-y-auto" style={{ height: height - 28 }}>
        {children}
      </div>
    </div>
  );
}
