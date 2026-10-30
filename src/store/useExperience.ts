import { create } from 'zustand'

export type Tier = 'high' | 'medium' | 'low'

export interface FocusTarget {
  id: string
  /** Point regardé par la caméra. */
  position: [number, number, number]
  /** Position visée par la caméra. */
  camera: [number, number, number]
}

interface ExperienceState {
  /** Chapitre actif, dérivé du scroll. */
  chapter: number
  /** Élément 3D survolé (depuis la scène ou depuis une ligne de texte). */
  hoverId: string | null
  /** Élément verrouillé par un clic : le panneau s'y consacre. */
  selectedId: string | null
  /** Cadrage rapproché en cours. */
  focus: FocusTarget | null

  tier: Tier
  reduced: boolean
  audio: boolean
  mapOpen: boolean
  introDone: boolean
  classic: boolean
  /** Vrai si le panneau mobile est réduit pour admirer la pièce 3D. */
  panelCollapsed: boolean
  /** Vrai quand la scène 3D a fini de se monter (ou est prête à être affichée). */
  sceneReady: boolean

  setChapter: (index: number) => void
  hover: (id: string | null) => void
  select: (target: FocusTarget) => void
  closeSelection: () => void
  setTier: (tier: Tier) => void
  setReduced: (reduced: boolean) => void
  setAudio: (audio: boolean) => void
  setMapOpen: (open: boolean) => void
  finishIntro: () => void
  setClassic: (classic: boolean) => void
  setPanelCollapsed: (collapsed: boolean) => void
  togglePanelCollapsed: () => void
  setSceneReady: (ready: boolean) => void
}

export const useExperience = create<ExperienceState>((set) => ({
  chapter: 0,
  hoverId: null,
  selectedId: null,
  focus: null,

  tier: 'high',
  reduced: false,
  audio: false,
  mapOpen: false,
  introDone: false,
  classic: false,
  panelCollapsed: false,
  sceneReady: false,

  setChapter: (index) => set({ chapter: index }),
  hover: (id) => set({ hoverId: id }),
  select: (target) => set({ selectedId: target.id, focus: target, hoverId: target.id }),
  closeSelection: () => set({ selectedId: null, focus: null, hoverId: null }),
  setTier: (tier) => set({ tier }),
  setReduced: (reduced) => set({ reduced }),
  setAudio: (audio) => set({ audio }),
  setMapOpen: (mapOpen) => set({ mapOpen }),
  finishIntro: () => set({ introDone: true }),
  setClassic: (classic) => set({ classic }),
  setPanelCollapsed: (panelCollapsed) => set({ panelCollapsed }),
  togglePanelCollapsed: () => set((state) => ({ panelCollapsed: !state.panelCollapsed })),
  setSceneReady: (sceneReady) => set({ sceneReady }),
}))
