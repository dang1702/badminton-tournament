import React, { useState } from 'react';
import { Layers, Users, ChevronRight, Edit2, Check, X, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Team } from '../utils/tournamentUtils';
import { useLanguage } from '../contexts/LanguageContext';

interface GroupDisplayProps {
  miniGroups: { [key: string]: Team[][] };
  onUpdateGroups?: (newGroups: { [key: string]: Team[][] }) => void;
  isEditable?: boolean;
}

// Sortable Item Component
const SortableTeamItem = ({ team, index }: { team: Team; index: number }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: team.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 mb-2 ${isDragging ? 'shadow-lg ring-2 ring-indigo-500 z-10' : 'hover:bg-slate-50'}`}
    >
      <div className="flex items-center gap-3 flex-1">
        <button {...attributes} {...listeners} className="cursor-grab touch-none p-1 text-slate-400 hover:text-slate-600">
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="text-xs font-bold text-slate-300 w-4 text-center">
          {index + 1}
        </span>
        <span className="font-medium text-slate-700 text-sm truncate">
          {team.name}
        </span>
      </div>
    </div>
  );
};

export const GroupDisplay: React.FC<GroupDisplayProps> = ({ miniGroups, onUpdateGroups, isEditable = false }) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [localGroups, setLocalGroups] = useState(miniGroups);
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync props to state when not editing
  if (!isEditing && JSON.stringify(miniGroups) !== JSON.stringify(localGroups)) {
    setLocalGroups(miniGroups);
  }

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    if (active.id !== over.id) {
      // Find source and dest containers
      const findContainer = (id: number) => {
        for (const zone of Object.keys(localGroups)) {
          if (localGroups[zone][0].find(t => t.id === id)) return zone;
        }
        return null;
      };

      const activeContainer = findContainer(active.id);
      const overContainer = findContainer(over.id);

      if (activeContainer && overContainer) {
        // Simple case: Reorder within same group
        if (activeContainer === overContainer) {
            const newGroups = { ...localGroups };
            const zoneTeams = [...newGroups[activeContainer][0]];
            const oldIndex = zoneTeams.findIndex((t) => t.id === active.id);
            const newIndex = zoneTeams.findIndex((t) => t.id === over.id);
            
            newGroups[activeContainer][0] = arrayMove(zoneTeams, oldIndex, newIndex);
            setLocalGroups(newGroups);
        } else {
            // Move between groups (Swap logic or insert?)
            // For now, let's implement simple SWAP if moving between groups to keep size equal
            // Or just allow moving.
            // Let's implement move.
            const newGroups = { ...localGroups };
            const sourceTeams = [...newGroups[activeContainer][0]];
            const destTeams = [...newGroups[overContainer][0]];

            const sourceIndex = sourceTeams.findIndex(t => t.id === active.id);
            const destIndex = destTeams.findIndex(t => t.id === over.id);

            // Swap items
            const [movedItem] = sourceTeams.splice(sourceIndex, 1);
            // We need to swap, so take the target item and put it in source
            // BUT dnd-kit sortable expects reordering list.
            // Swapping between lists is complex with this setup.
            // Let's stick to REORDERING within same list for MVP simplicity first,
            // or implement full multi-container drag and drop.
            
            // For this version, let's just support Reordering WITHIN Group to fix seed order
            // If user wants to swap A and B, they can just reorder A list and B list? No.
            
            // To support moving between A and B, we need to know we are over a different container.
            // Let's just do swap for now
             const targetItem = destTeams[destIndex];
             destTeams[destIndex] = movedItem;
             sourceTeams.splice(sourceIndex, 0, targetItem); // Put target back where source was
             
             newGroups[activeContainer][0] = sourceTeams;
             newGroups[overContainer][0] = destTeams;
             setLocalGroups(newGroups);
        }
      }
    }
  };

  const handleSave = () => {
    if (onUpdateGroups) {
      onUpdateGroups(localGroups);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalGroups(miniGroups);
    setIsEditing(false);
  };

  if (!miniGroups.A) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-100 rounded-xl shadow-sm">
            <Layers className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t('qualifyingGroups')}</h2>
            <p className="text-sm text-slate-500 font-medium">{t('groupStageDist')}</p>
          </div>
        </div>
        
        {/* Edit Button */}
        {isEditable && !isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
          >
            <Edit2 className="w-4 h-4" />
            Edit Groups
          </button>
        )}

        {isEditing && (
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              Save
            </button>
          </div>
        )}
      </div>

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid md:grid-cols-2 gap-8">
          {Object.keys(localGroups).map((zone) => (
            <div key={zone} className="relative">
              {/* Zone Header */}
              <div className="flex items-center gap-2 mb-4 sticky top-20 z-10 bg-slate-50/95 backdrop-blur py-2">
                <span className="w-2 h-8 bg-indigo-500 rounded-full" />
                <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider">
                  {t('zone')} {zone}
                </h3>
              </div>
              
              <div className="space-y-5">
                {localGroups[zone].map((group, i) => (
                  <div 
                    key={i} 
                    className={`
                      bg-white rounded-2xl border transition-all duration-300 overflow-hidden group
                      ${isEditing ? 'border-indigo-300 ring-2 ring-indigo-50 shadow-md' : 'border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 hover:-translate-y-1'}
                    `}
                  >
                    {/* Group Header */}
                    <div className="bg-gradient-to-r from-slate-50 to-white px-5 py-3 border-b border-slate-100 flex justify-between items-center group-hover:from-indigo-50/50 group-hover:to-white transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md text-sm border border-indigo-100">
                          {zone}{i + 1}
                        </span>
                        <span className="text-sm font-semibold text-slate-700">{t('groupStage')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-white px-2 py-1 rounded-full border border-slate-200">
                        <Users className="w-3 h-3" />
                        {group.length}
                      </div>
                    </div>
                    
                    {/* Team List */}
                    <div className="p-4 space-y-2">
                      {isEditing ? (
                        <SortableContext 
                          items={group.map(t => t.id)} 
                          strategy={verticalListSortingStrategy}
                        >
                          {group.map((team, idx) => (
                            <SortableTeamItem key={team.id} team={team} index={idx} />
                          ))}
                        </SortableContext>
                      ) : (
                        group.map((team, idx) => (
                          <div 
                            key={team.id} 
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-300 w-4 text-center">
                                {idx + 1}
                              </span>
                              <span className="font-medium text-slate-700 text-sm">
                                {team.name}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <DragOverlay>
            {activeId ? (
                <div className="p-3 bg-white border border-indigo-500 rounded-lg shadow-xl opacity-90 cursor-grabbing">
                   Dragging Item...
                </div>
            ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
