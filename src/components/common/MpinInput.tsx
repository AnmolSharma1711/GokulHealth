import React, { useRef } from 'react';

interface Props {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function MpinInput({ length = 4, value, onChange, disabled = false }: Props) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) return;

    let newValueArray = value.split('');
    newValueArray[index] = val[val.length - 1]; // take the last character
    
    let finalValue = '';
    for(let i=0; i<length; i++) {
        finalValue += newValueArray[i] || '';
    }
    onChange(finalValue.substring(0, length));

    if (index < length - 1 && val) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newValue = value.split('');
      if (newValue[index]) {
        newValue[index] = '';
        onChange(newValue.join(''));
      } else if (index > 0) {
        newValue[index - 1] = '';
        onChange(newValue.join(''));
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <div className="flex gap-4 justify-center py-2">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={value[idx] || ''}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          disabled={disabled}
          className="w-14 h-14 rounded-full bg-white border-2 border-slate-200 text-center text-2xl font-black text-slate-800 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none selection:bg-transparent disabled:opacity-50"
        />
      ))}
    </div>
  );
}
