import { useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { getDesignSuggestions } from '../lib/designAssistant';

/** Debounced project analysis → ui.designSuggestions */
export default function DesignSuggestionsBridge() {
  const project = useAppStore((s) => s.project);
  const setDesignSuggestions = useAppStore((s) => s.setDesignSuggestions);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setDesignSuggestions(getDesignSuggestions(project));
    }, 500);
    return () => clearTimeout(timer.current);
  }, [project, setDesignSuggestions]);

  return null;
}
