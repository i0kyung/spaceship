export const storyTexts = {
  boarding: {
    title: '탑승 준비',
    description: '우주선에 오르기 전, 탑승자 정보와 손 인식을 확인할게요.',
    nicknameLabel: '탑승자 이름을 입력해주세요',
    nicknamePlaceholder: '이름 없는 우주비행사',
    handIdle: '손을 카메라 앞에 보여주세요',
    handRequesting: '카메라를 켜는 중…',
    handLoading: '손 인식 준비 중…',
    handReady: '손 인식 완료! 이제 우주창을 닦을 수 있어요',
    handError: '카메라를 사용할 수 없어 마우스 닦기 모드로 전환했어요.',
    startButton: '손 인식 시작하기',
    boardButton: '우주선 탑승하기',
  },
  hero: {
    eyebrow: '1993 → 지금',
    title: '꿈돌이의 첫 비행',
    subtitle: '우주선에 올라탄 꿈돌이가, 마우스를 따라 두리번거려요.',
    hint: '마우스를 좌우로 움직여보세요',
  },
  wipe: {
    title: '우주창 닦기',
    description: '뿌옇게 흐려진 창문을 문질러서 바깥 우주를 확인해보세요.',
    hint: '손을 움직여 창문을 닦아보세요',
    hintMouse: '드래그해서 창문을 닦아보세요',
    modeHand: '🖐 손 인식 모드',
    modeMouse: '🖱 마우스 닦기 모드',
    cleared: '창문이 맑아졌어요! 바깥 우주가 보여요.',
    nextButton: '다음 목적지로 이동',
  },
  loading: {
    phrases: ['엔진 점화 중…', '별빛 좌표 확인 중…', '목적지 신호 수신 중…'],
  },
  gacha: {
    title: '목적지 뽑기',
    description: '깨끗해진 우주창 너머, 목적지 신호가 도착했어요.',
    hint: '캡슐을 뽑아 목적지를 확인해보세요.',
  },
  arrival: {
    title: '어디를 뽑아도, 별빛은 한 곳을 가리켰다.',
    subtitle: '지구. 그리고 대전.',
    description:
      '수많은 별들 사이에서도, 꿈돌이의 우주선은 결국 푸른 지구로 향합니다. 1993 대전엑스포의 꿈을 실은 채로.',
  },
} as const
