import { UndoRedoListener } from './components/UndoRedoListener';
import SystemRibbon from './components/SystemRibbon';
import ToolRibbon from './components/ToolRibbon';
import Viewport from './components/Viewport';
import RightSidebar from './components/RightSidebar';

export default function App() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-hidden">
      <UndoRedoListener />
      <SystemRibbon />
      <div className="flex flex-1 min-h-0">
        <ToolRibbon />
        <Viewport />
        <RightSidebar />
      </div>
    </div>
  );
}
