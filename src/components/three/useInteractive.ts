import { useCallback } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { useExperience } from '../../store/useExperience'
import { ANCHORS, focusTargetFor } from '../../experience/anchors'
import { chapterIndexById } from '../../experience/chapters'
import { playTick } from '../../lib/audio'

/**
 * Branche un objet 3D sur le contenu : survol, clic, cadrage caméra.
 * Tous les objets interactifs passent par ce hook, ce qui garantit
 * qu'aucun élément de décor ne devient cliquable sans contenu associé.
 */
export function useInteractive(id: string) {
  const hover = useExperience((state) => state.hover)
  const select = useExperience((state) => state.select)
  const setChapter = useExperience((state) => state.setChapter)

  const onPointerOver = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation()
      hover(id)
      document.body.style.cursor = 'pointer'
    },
    [hover, id],
  )

  const onPointerOut = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation()
      hover(null)
      document.body.style.cursor = ''
    },
    [hover],
  )

  const onClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation()
      const target = focusTargetFor(id)
      if (!target) return

      // Le panneau suit toujours l'objet regardé : cliquer sur la bibliothèque
      // depuis un autre chapitre ouvre bien le chapitre « Parcours ».
      const anchor = ANCHORS[id]
      const index = anchor ? chapterIndexById(anchor.chapter) : -1
      if (index >= 0) setChapter(index)

      select(target)
      useExperience.getState().setPanelCollapsed(false)
      playTick('select')
    },
    [id, select, setChapter],
  )

  return { onPointerOver, onPointerOut, onClick }
}

/** Vrai si l'élément est survolé ou sélectionné. */
export function useIsActive(id: string): boolean {
  return useExperience((state) => state.hoverId === id || state.selectedId === id)
}
