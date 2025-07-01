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
        onValueChange={(vals: any) => onChange(vals[0])}
        min={0}
        max={100}
        step={1}
        className="flex-1"
      />
      <span className="w-12 text-right">{value}%</span>
    </div>
  );
}