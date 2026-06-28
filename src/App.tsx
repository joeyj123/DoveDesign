import { UndoRedoListener } from './components/UndoRedoListener';
import SystemRibbon from './components/SystemRibbon';
import LeftToolPanel from './components/LeftToolPanel';
import Viewport from './components/Viewport';
import RightSidebar from './components/RightSidebar';
import AssemblyGuidePanel from './components/AssemblyGuidePanel';
import EdgeTreatmentPanel from './components/EdgeTreatmentPanel';
import TemplatePickerModal from './components/TemplatePickerModal';
import BomPanel from './components/BomPanel';

export default function App() {
  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-hidden">
      <UndoRedoListener />
      <SystemRibbon />
      <div className="flex flex-1 min-h-0">
        <LeftToolPanel />
        <Viewport />
        <AssemblyGuidePanel />
        <EdgeTreatmentPanel />
        <RightSidebar />
      </div>
      <TemplatePickerModal />
      <BomPanel />
    </div>
  );
}
