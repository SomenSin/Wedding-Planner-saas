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
    <div ref={setNodeRef} style={style} className="group flex items-center gap-4 p-4 bg-background border border-border mb-3 hover:border-primary transition-all rounded-xl shadow-sm">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
        <GripVertical className="h-5 w-5" />
      </div>
      
      <div className="flex-1">
        <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">{module.title}</h4>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{module.widgets?.length || 0} Widgets Active</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
            {module.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <Switch 
            checked={module.enabled} 
            onCheckedChange={(checked) => onToggle(module.id, checked)}
          />
        </div>
        
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-accent hover:text-accent-foreground" onClick={() => onEdit(module)}>
          <Settings className="h-4 w-4" />
        </Button>
        
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(module.id)}>
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
            <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg">
              Unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {modules.length === 0 && (
            <Button variant="outline" className="rounded-xl border-input bg-background hover:bg-accent" onClick={onSeedModules}>
              Seed Initial Modules
            </Button>
          )}
          <Button
            variant="outline"
            className="rounded-xl border-input bg-background hover:bg-accent"
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
            className={`rounded-xl px-6 font-semibold transition-all ${
              modulesDirty
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
                : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
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
        <DialogContent className="max-w-2xl rounded-3xl border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-2xl text-foreground">
              {editingModule?.id ? 'Edit Module' : 'Create Module'}
            </DialogTitle>
            <DialogDescription className="uppercase tracking-widest text-[10px] font-bold text-muted-foreground">
              Configure widgets and layout for this dashboard section
            </DialogDescription>
          </DialogHeader>

          {editingModule && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Module Title</Label>
                <Input 
                  value={editingModule.title} 
                  onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                  className="rounded-xl border-input bg-background text-foreground"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Widgets</Label>
                  <Button variant="outline" size="sm" className="rounded-xl text-[10px] border-input hover:bg-accent" onClick={() => {
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

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {editingModule.widgets.map((widget, idx) => (
                    <div key={widget.id} className="p-4 border border-border bg-muted/30 rounded-xl space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Title</Label>
                            <Input 
                              value={widget.title}
                              onChange={(e) => {
                                const newWidgets = [...editingModule.widgets];
                                newWidgets[idx].title = e.target.value;
                                setEditingModule({ ...editingModule, widgets: newWidgets });
                              }}
                              className="h-8 text-xs rounded-lg border-input bg-background"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">Type</Label>
                            <select 
                              value={widget.type}
                              onChange={(e) => {
                                const newWidgets = [...editingModule.widgets];
                                newWidgets[idx].type = e.target.value as any;
                                setEditingModule({ ...editingModule, widgets: newWidgets });
                              }}
                              className="w-full h-8 px-2 text-xs border border-input bg-background rounded-lg text-foreground focus:ring-1 focus:ring-primary outline-none"
                            >
                              <option value="metric">Metric</option>
                              <option value="table">Table</option>
                              <option value="progress">Progress</option>
                              <option value="kanban">Kanban</option>
                              <option value="toggle">Toggle</option>
                            </select>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 ml-2 rounded-full hover:bg-destructive/10" onClick={() => {
                          const newWidgets = editingModule.widgets.filter((_, i) => i !== idx);
                          setEditingModule({ ...editingModule, widgets: newWidgets });
                        }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {editingModule.widgets.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-xl text-muted-foreground uppercase tracking-widest text-[10px] font-bold">
                      No widgets configured
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-border">
                <Button variant="outline" className="rounded-xl font-medium border-input hover:bg-accent" onClick={() => setEditingModule(null)}>Cancel</Button>
                <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 px-8 font-semibold shadow-md" onClick={() => onSaveModule(editingModule)}>
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
