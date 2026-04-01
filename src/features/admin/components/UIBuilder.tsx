import React, { useState } from 'react';
import { 
  GripVertical, 
  Settings, 
  Trash2, 
  Plus, 
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DashboardModule, DashboardWidget } from '@/types/admin';

interface SortableModuleItemProps {
  module: DashboardModule;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (module: DashboardModule) => void;
}

const SortableModuleItem: React.FC<SortableModuleItemProps> = ({ module, onToggle, onDelete, onEdit }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="group flex items-center gap-4 p-4 bg-white border border-stone-200 mb-2 hover:border-black transition-all">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-stone-400 hover:text-black">
        <GripVertical className="h-5 w-5" />
      </div>
      
      <div className="flex-1">
        <h4 className="text-sm font-bold uppercase tracking-wider">{module.title}</h4>
        <p className="text-[10px] text-stone-500 uppercase tracking-widest">{module.widgets?.length || 0} Widgets Active</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
            {module.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <Switch 
            checked={module.enabled} 
            onCheckedChange={(checked) => onToggle(module.id, checked)}
          />
        </div>
        
        <Button variant="ghost" size="icon" onClick={() => onEdit(module)}>
          <Settings className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onDelete(module.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

interface UIBuilderProps {
  modules: DashboardModule[];
  modulesDirty: boolean;
  isSavingModules: boolean;
  onDragEnd: (event: any) => void;
  onToggleModule: (id: string, enabled: boolean) => void;
  onDeleteModule: (id: string) => void;
  onSaveAllModules: () => void;
  onSeedModules: () => void;
  onSaveModule: (module: DashboardModule) => void;
}

export const UIBuilder: React.FC<UIBuilderProps> = ({
  modules,
  modulesDirty,
  isSavingModules,
  onDragEnd,
  onToggleModule,
  onDeleteModule,
  onSaveAllModules,
  onSeedModules,
  onSaveModule
}) => {
  const [editingModule, setEditingModule] = useState<DashboardModule | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          {modulesDirty && (
            <span className="text-[10px] uppercase tracking-widest font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {modules.length === 0 && (
            <Button variant="outline" className="rounded-none border-stone-200" onClick={onSeedModules}>
              Seed Initial Modules
            </Button>
          )}
          <Button
            variant="outline"
            className="rounded-none border-stone-200"
            onClick={() => {
              const newModule: DashboardModule = {
                id: Math.random().toString(36).substr(2, 9),
                name: 'new_module',
                label: 'New Module',
                title: 'New Module',
                enabled: true,
                order: modules.length,
                widgets: []
              };
              setEditingModule(newModule);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Create New Module
          </Button>
          <Button
            className={`rounded-none px-6 ${
              modulesDirty
                ? 'bg-black hover:bg-black/90 text-white'
                : 'bg-stone-100 text-stone-400 cursor-not-allowed'
            }`}
            disabled={!modulesDirty || isSavingModules}
            onClick={onSaveAllModules}
          >
            {isSavingModules ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext 
          items={modules.map(m => m.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {modules.map((module) => (
              <SortableModuleItem 
                key={module.id} 
                module={module} 
                onToggle={onToggleModule}
                onDelete={onDeleteModule}
                onEdit={(m) => setEditingModule(m)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Dialog open={!!editingModule} onOpenChange={(open) => !open && setEditingModule(null)}>
        <DialogContent className="max-w-2xl rounded-none">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-2xl">
              {editingModule?.id ? 'Edit Module' : 'Create Module'}
            </DialogTitle>
            <DialogDescription className="uppercase tracking-widest text-[10px] font-bold">
              Configure widgets and layout for this dashboard section
            </DialogDescription>
          </DialogHeader>

          {editingModule && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Module Title</Label>
                <Input 
                  value={editingModule.title} 
                  onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                  className="rounded-none border-stone-200"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-stone-500">Widgets</Label>
                  <Button variant="outline" size="sm" className="rounded-none text-[10px]" onClick={() => {
                    const newWidget: DashboardWidget = {
                      id: Math.random().toString(36).substr(2, 9),
                      type: 'metric',
                      title: 'New Widget',
                      config: { value: '0' }
                    };
                    setEditingModule({ ...editingModule, widgets: [...editingModule.widgets, newWidget] });
                  }}>
                    <Plus className="h-3 w-3 mr-1" /> Add Widget
                  </Button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {editingModule.widgets.map((widget, idx) => (
                    <div key={widget.id} className="p-4 border border-stone-100 bg-stone-50/50 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-[9px] uppercase tracking-widest text-stone-400">Title</Label>
                            <Input 
                              value={widget.title}
                              onChange={(e) => {
                                const newWidgets = [...editingModule.widgets];
                                newWidgets[idx].title = e.target.value;
                                setEditingModule({ ...editingModule, widgets: newWidgets });
                              }}
                              className="h-8 text-xs rounded-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[9px] uppercase tracking-widest text-stone-400">Type</Label>
                            <select 
                              value={widget.type}
                              onChange={(e) => {
                                const newWidgets = [...editingModule.widgets];
                                newWidgets[idx].type = e.target.value as any;
                                setEditingModule({ ...editingModule, widgets: newWidgets });
                              }}
                              className="w-full h-8 px-2 text-xs border border-stone-200 bg-white rounded-none"
                            >
                              <option value="metric">Metric</option>
                              <option value="table">Table</option>
                              <option value="progress">Progress</option>
                              <option value="kanban">Kanban</option>
                              <option value="toggle">Toggle</option>
                            </select>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-400 h-8 w-8 ml-2" onClick={() => {
                          const newWidgets = editingModule.widgets.filter((_, i) => i !== idx);
                          setEditingModule({ ...editingModule, widgets: newWidgets });
                        }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {editingModule.widgets.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-stone-100 text-stone-400 uppercase tracking-widest text-[10px] font-bold">
                      No widgets configured
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
                <Button variant="outline" className="rounded-none" onClick={() => setEditingModule(null)}>Cancel</Button>
                <Button className="rounded-none bg-black hover:bg-black/90 px-8" onClick={() => onSaveModule(editingModule)}>
                  Save Module Configuration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
