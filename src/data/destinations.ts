export interface Destination {
  id: string
  name: string
  color: string
  /** true인 항목만 최종적으로 뽑힐 수 있음 — 스토리상 항상 지구/대전으로 수렴 */
  isRealDestination: boolean
}

export const destinations: Destination[] = [
  { id: 'nebula', name: '알 수 없는 성운', color: '#c9b6f7', isRealDestination: false },
  { id: 'moon', name: '달의 뒷면', color: '#e8e8e8', isRealDestination: false },
  { id: 'saturn', name: '토성의 고리', color: '#f7d9a0', isRealDestination: false },
  { id: 'earth', name: '지구, 대전', color: '#8fd6ff', isRealDestination: true },
  { id: 'comet', name: '떠도는 혜성', color: '#a0f0d0', isRealDestination: false },
]
