'use client';

import { Slider } from '@/components/ui/slider';

interface ProgressInputProps {
  value: number;
  onChange: (value: number) => void;
}

export default function ProgressInput({ value, onChange }: ProgressInputProps) {
  return (
    <div className="flex items-center gap-4">
      <Slider
        value={[value]}
        onValueChange={(vals: number[]) => onChange(vals[0])}
        min={0}
        max={100}
        step={1}
        className="flex-1"
      />

      <input
        type="number"
        min={0}
        max={100}
        value={value}
        onChange={(e) => {
          const newValue = Math.max(0, Math.min(100, Number(e.target.value)));
          onChange(newValue);
        }}
        className="w-16 px-2 py-1 border border-gray-300 rounded text-right"
      />

      <span className="w-5 text-sm text-gray-600">%</span>
    </div>
  );
}