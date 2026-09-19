const menuButton = document.querySelector('#menuButton');
const mainNav = document.querySelector('#mainNav');
const landmarksSection = document.querySelector('#landmarks');
const landmarksStage = landmarksSection?.querySelector('.landmarks-sticky');

const buildModal = document.querySelector('#buildModal');
const buildModalClose = document.querySelector('#buildModalClose');
const buildModalVideo = document.querySelector('#buildModalVideo');
const buildModalYoutube = document.querySelector('#buildModalYoutube');
const buildModalVideoStage = buildModalVideo?.closest(
  '.build-modal-video-stage',
);
const buildModalPlay = document.querySelector('#buildModalPlay');
const buildModalProgress = document.querySelector('#buildModalProgress');
const buildModalTime = document.querySelector('#buildModalTime');
const backToTop = document.querySelector('#backToTop');

// HERO 낙하 블록 애니메이션
function setupFallingBricks() {
  const hero = document.querySelector('.hero');
  const bricks = [...document.querySelectorAll('.hero .falling-brick')];

  if (!hero || bricks.length === 0) return;

  const configs = [
    { duration: 9600, offset: 1400, drift: -118, sway: 28, rotate: -306 },
    { duration: 11800, offset: 7500, drift: 124, sway: 34, rotate: 298 },
    { duration: 10700, offset: 4100, drift: -66, sway: 22, rotate: 246 },
    { duration: 12600, offset: 10800, drift: 168, sway: 38, rotate: 358 },
    { duration: 13100, offset: 5800, drift: -168, sway: 36, rotate: -350 },
    { duration: 9100, offset: 2700, drift: 94, sway: 24, rotate: 264 },
    { duration: 11300, offset: 8900, drift: -136, sway: 30, rotate: -366 },
    { duration: 10200, offset: 6300, drift: 126, sway: 30, rotate: 330 },
    { duration: 12900, offset: 3600, drift: -184, sway: 36, rotate: -326 },
    { duration: 13500, offset: 11600, drift: 174, sway: 40, rotate: 390 },
    { duration: 8400, offset: 6900, drift: 70, sway: 20, rotate: 294 },
    { duration: 14200, offset: 12400, drift: -104, sway: 28, rotate: -286 },
  ];

  bricks.forEach((brick) => {
    brick.style.setProperty('animation', 'none', 'important');
    brick.style.setProperty('top', '0px', 'important');
    brick.style.setProperty('display', 'block', 'important');
    brick.style.setProperty('visibility', 'visible', 'important');
    brick.style.setProperty('pointer-events', 'none', 'important');
    brick.style.setProperty('will-change', 'transform, opacity', 'important');

    brick.addEventListener('error', () => {
      console.error(
        '[HERO LEGO] 블록 이미지를 찾지 못했습니다:',
        brick.getAttribute('src'),
      );
    });
  });

  const startedAt = performance.now();
  let animationFrame = 0;

  function draw(now) {
    const heroHeight = Math.max(hero.clientHeight, 520);
    const travelDistance = heroHeight + 330;

    bricks.forEach((brick, index) => {
      const config = configs[index] || configs[0];

      const progress =
        ((now - startedAt + config.offset) % config.duration) / config.duration;

      const y = -170 + travelDistance * progress;

      const x =
        config.drift * progress +
        Math.sin(progress * Math.PI * 2) * config.sway;
      const rotation = config.rotate * progress;

      let opacity = 1;
      if (progress < 0.045) opacity = progress / 0.045;
      if (progress > 0.93) opacity = (1 - progress) / 0.07;
      opacity = Math.max(0, Math.min(1, opacity));

      brick.style.setProperty(
        'transform',
        `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rotation.toFixed(1)}deg)`,
        'important',
      );
      brick.style.setProperty('opacity', String(opacity), 'important');
    });

    animationFrame = requestAnimationFrame(draw);
  }

  animationFrame = requestAnimationFrame(draw);

  window.addEventListener(
    'beforeunload',
    () => cancelAnimationFrame(animationFrame),
    { once: true },
  );
}

setupFallingBricks();

if (menuButton && mainNav) {
  const mobileMenu = window.matchMedia('(max-width: 980px)');
  function setMenuOpen(open, restoreFocus = false) {
    mainNav.classList.toggle('open', open);
    menuButton.textContent = open ? '×' : '☰';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    if (restoreFocus) menuButton.focus();
  }
  menuButton.addEventListener('click', () => {
    setMenuOpen(!mainNav.classList.contains('open'));
  });
  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mainNav.classList.contains('open')) {
      setMenuOpen(false, true);
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) setMenuOpen(false);
  });
  mobileMenu.addEventListener('change', () => setMenuOpen(false));
  setMenuOpen(false);
}

// This intro runs once per page load; scrolling never restarts it.
const heroIntro = document.querySelector('#heroIntro');
heroIntro?.addEventListener(
  'animationend',
  (event) => {
    if (event.animationName === 'hero-intro-once') heroIntro.hidden = true;
  },
  { once: true },
);

// 비디오 재생
function safePlay(video) {
  if (!(video instanceof HTMLVideoElement)) return;
  video.muted = true;
  video.playsInline = true;
  const result = video.play();
  if (result && typeof result.catch === 'function') result.catch(() => {});
}

document.querySelectorAll('#landmarksVideo').forEach((video) => {
  if (!(video instanceof HTMLVideoElement)) return;
  safePlay(video);
  video.addEventListener('canplay', () => safePlay(video));
});

// LANDMARKS 문 열림 애니메이션
function setupLandmarksDoor() {
  if (!landmarksSection || !landmarksStage) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frameId = 0;

  function smoothStep(value) {
    return value * value * (3 - 2 * value);
  }

  function lineProgress(value, start, end) {
    const normalized = Math.min(
      1,
      Math.max(0, (value - start) / (end - start)),
    );
    return smoothStep(normalized);
  }

  function updateDoor() {
    const scrollY = window.scrollY;
    const viewportWidth = window.innerWidth;
    const siteHeader = document.querySelector('.site-header');
    const hero = document.querySelector('.hero');

    if (siteHeader && hero) {
      const showHeaderAt = 120;

      if (scrollY < showHeaderAt && viewportWidth > 980) {
        siteHeader.style.opacity = '0';
        siteHeader.style.transform = 'translateY(-100%)';
        siteHeader.style.pointerEvents = 'none';
      } else {
        siteHeader.style.opacity = '1';
        siteHeader.style.transform = 'translateY(0)';
        siteHeader.style.pointerEvents = '';
      }
    }

    const navHeight = viewportWidth <= 980 ? 74 : 86;
    const stageHeight = landmarksStage.offsetHeight;
    const sectionRect = landmarksSection.getBoundingClientRect();
    const sectionTop = scrollY + sectionRect.top;
    const stageTop = navHeight;

    const pinStart = sectionTop - stageTop;
    const pinEnd =
      sectionTop + landmarksSection.offsetHeight - stageHeight - stageTop;
    const pinTravel = Math.max(1, pinEnd - pinStart);

    const revealCssValue = getComputedStyle(landmarksSection)
      .getPropertyValue('--landmarks-reveal-scroll')
      .trim();

    let revealTravel = pinTravel * 0.7;

    if (revealCssValue.endsWith('vh')) {
      const vhValue = Number.parseFloat(revealCssValue);
      if (Number.isFinite(vhValue)) {
        revealTravel = Math.max(1, (window.innerHeight * vhValue) / 100);
      }
    } else if (revealCssValue.endsWith('px')) {
      const pxValue = Number.parseFloat(revealCssValue);
      if (Number.isFinite(pxValue)) {
        revealTravel = Math.max(1, pxValue);
      }
    }

    revealTravel = Math.min(pinTravel, Math.max(1, revealTravel));
    const rawProgress = (scrollY - pinStart) / revealTravel;
    const progress = Math.min(1, Math.max(0, rawProgress));
    const easedProgress = smoothStep(progress);
    const finalProgress = reduceMotion.matches ? 1 : easedProgress;
    const openPercent = Math.round(finalProgress * 10000) / 100;

    landmarksSection.style.setProperty(
      '--landmarks-door-top-y',
      `-${openPercent}%`,
    );
    landmarksSection.style.setProperty(
      '--landmarks-door-bottom-y',
      `${openPercent}%`,
    );
    landmarksSection.style.setProperty(
      '--landmarks-door-progress',
      String(finalProgress),
    );

    const firstLineProgress = reduceMotion.matches
      ? 1
      : lineProgress(progress, 0.4, 0.64);
    const secondLineProgress = reduceMotion.matches
      ? 1
      : lineProgress(progress, 0.62, 0.86);
    const titleExitProgress = reduceMotion.matches
      ? 0
      : lineProgress(progress, 0.82, 1.0);
    const softenedTitleExit = Math.pow(titleExitProgress, 1.45);
    const titleVisibility = 1 - softenedTitleExit;

    landmarksSection.style.setProperty(
      '--landmarks-line-one-opacity',
      String(firstLineProgress * titleVisibility),
    );
    landmarksSection.style.setProperty(
      '--landmarks-line-one-y',
      `${Math.round((1 - firstLineProgress) * 58)}px`,
    );
    landmarksSection.style.setProperty(
      '--landmarks-line-one-clip',
      `${Math.round((1 - firstLineProgress) * 10000) / 100}%`,
    );

    landmarksSection.style.setProperty(
      '--landmarks-line-two-opacity',
      String(secondLineProgress * titleVisibility),
    );
    landmarksSection.style.setProperty(
      '--landmarks-line-two-y',
      `${Math.round((1 - secondLineProgress) * 58)}px`,
    );
    landmarksSection.style.setProperty(
      '--landmarks-line-two-clip',
      `${Math.round((1 - secondLineProgress) * 10000) / 100}%`,
    );

    if (scrollY < pinStart) {
      landmarksStage.style.position = 'absolute';
      landmarksStage.style.top = '0px';
      landmarksStage.style.left = '0px';
      landmarksStage.style.right = '0px';
      landmarksStage.style.width = '100%';
      return;
    }

    if (scrollY <= pinEnd) {
      landmarksStage.style.position = 'fixed';
      landmarksStage.style.top = `${stageTop}px`;
      landmarksStage.style.left = '0px';
      landmarksStage.style.right = '0px';
      landmarksStage.style.width = '100%';
      return;
    }

    landmarksStage.style.position = 'absolute';
    landmarksStage.style.top = `${Math.max(0, landmarksSection.offsetHeight - stageHeight)}px`;
    landmarksStage.style.left = '0px';
    landmarksStage.style.right = '0px';
    landmarksStage.style.width = '100%';
  }

  function requestUpdate() {
    if (frameId) return;
    frameId = requestAnimationFrame(() => {
      frameId = 0;
      updateDoor();
    });
  }

  updateDoor();
  window.addEventListener('load', requestUpdate);
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  reduceMotion.addEventListener?.('change', requestUpdate);
}

setupLandmarksDoor();

const LANDMARK_DATA = {
  eiffel: {
    header: 'FRANCE / PARIS',
    country: 'FRANCE · 프랑스',
    cityMark: 'PARIS',
    sideNote: 'A<br>SMALL BRICK<br>A BRIGHTER<br>TOMORROW',
    title: 'EIFFEL TOWER',
    ko: '에펠탑',
    description:
      '1889년 만국박람회를 위해 세워진 330m의 철골 타워. 1,247개의 다크 레드 브릭으로 격자 구조를 한 칸 한 칸 재현하고, 두 개의 전망 플랫폼을 스터드 단위로 올려 완성했습니다.',
    quote: '“The Eiffel Tower is rebuilt brick by brick in LEGO style.”',
    bricks: '1,247',
    scale: '1:180',
    height: '300M',
    region: 'EUROPE',
    image: 'videos/영상 6개 대표이미지/에펠탑.png',
    video: 'videos/영상 6개/Eippel_Tower_4k_ver2.mp4',
    youtube: 'https://youtu.be/266WXoPY7fI', // YouTube URL 또는 영상 ID 입력
  },

  bigben: {
    header: 'UNITED KINGDOM / LONDON — 빅벤',
    country: 'UNITED KINGDOM · 영국',
    cityMark: 'LONDON',
    sideNote: 'TIME<br>BUILT<br>BRICK BY<br>BRICK',
    title: 'BIG BEN',
    ko: '빅벤',
    description:
      '웨스트민스터 궁전에서 솟은 96m의 시계탑 엘리자베스 타워. 탄 컬러 브릭으로 탑신을 쌓고, 크림색 시계판과 검은 슬레이트 첨탑, 꼭대기의 깃발까지 블록으로 재현했습니다.',
    quote: '“Big Ben chimes again — every brick in place.”',
    bricks: '986',
    scale: '1:160',
    height: '96M',
    region: 'EUROPE',
    image: 'videos/영상 6개 대표이미지/빅벤.png',
    video: 'videos/영상 6개/big_ben_4k.mp4',
    youtube: 'https://youtu.be/s5ermZCqxXw', // YouTube URL 또는 영상 ID 입력
  },

  colosseum: {
    header: 'ITALY / ROME — 콜로세움',
    country: 'ITALY · 이탈리아',
    cityMark: 'ROME',
    sideNote: 'HISTORY<br>STACKED<br>IN SAND<br>BRICKS',
    title: 'COLOSSEUM',
    ko: '콜로세움',
    description:
      '로마 제국의 상징인 원형 경기장. 샌드 옐로 브릭으로 3층 아치를 두르고, 2,000년 세월이 남긴 붕괴된 우측 단면까지 그대로 살려 블록으로 옮겼습니다.',
    quote: '“2,000 years of history, stacked in sand-yellow bricks.”',
    bricks: '2,380',
    scale: '1:220',
    height: '48M',
    region: 'EUROPE',
    image: 'videos/영상 6개 대표이미지/콜로세움.png',
    video: 'videos/영상 6개/collosseum_4k.mp4',
    youtube: 'https://youtu.be/DBAqqqXsDfQ', // YouTube URL 또는 영상 ID 입력
  },

  statue: {
    header: 'USA / NEW YORK — 자유의 여신상',
    country: 'USA · 미국',
    cityMark: 'NEW YORK',
    sideNote: 'LIBERTY<br>BUILT<br>ONE BRICK<br>AT A TIME',
    title: 'STATUE OF LIBERTY',
    ko: '자유의 여신상',
    description:
      '1886년 프랑스가 선물한 자유의 상징. 샌드 그린 브릭으로 여신의 실루엣을 쌓아 올리고, 높이 든 횃불의 황금 불꽃과 석조 받침대를 블록으로 완성했습니다.',
    quote: '“Liberty enlightens the world — one green brick at a time.”',
    bricks: '1,562',
    scale: '1:200',
    height: '93M',
    region: 'AMERICA',
    image: 'videos/영상 6개 대표이미지/자유의여신상.png',
    video: 'videos/영상 6개/Statue_of_Liberty_LEGO_build0909_4k.mp4',
    youtube: 'https://youtu.be/wB3TEmz4zD0', // YouTube URL 또는 영상 ID 입력
  },

  nseoul: {
    header: 'KOREA / SEOUL — N서울타워',
    country: 'KOREA · 한국',
    cityMark: 'SEOUL',
    sideNote: 'SEOUL<br>SHINES<br>BRICK BY<br>BRICK',
    title: 'N SEOUL TOWER',
    ko: 'N서울타워',
    description:
      '남산 꼭대기에서 서울을 내려다보는 상징적인 타워. 화이트 브릭 타워 신과 원형 전망데크의 블루 윈도우 밴드, 붉은 안테나를 얹고 남산의 초록 능선을 브릭 언덕으로 표현했습니다.',
    quote: '“Seoul shines from Namsan, brick by brick.”',
    bricks: '874',
    scale: '1:150',
    height: '236M',
    region: 'ASIA',
    image: 'videos/영상 6개 대표이미지/남산타워.png',
    video: 'videos/영상 6개/Namsan_Tower_4k.mp4',
    youtube: 'https://youtu.be/xNCFx9CTni8', // YouTube URL 또는 영상 ID 입력
  },

  tajmahal: {
    header: 'INDIA / AGRA — 타지마할',
    country: 'INDIA · 인도',
    cityMark: 'AGRA',
    sideNote: 'LOVE<br>BUILT<br>IN WHITE<br>BRICKS',
    title: 'TAJ MAHAL',
    ko: '타지마할',
    description:
      '무굴 제국 황제 샤 자한이 왕비 뭄타즈 마할을 기리기 위해 세운 흰 대리석 영묘. 화이트 브릭으로 대칭적인 중앙 돔과 네 개의 미나레트를 세우고, 정원과 수로의 균형까지 블록으로 재현했습니다.',
    quote: '“A monument to love, rebuilt in white bricks.”',
    bricks: '2,420',
    scale: '1:200',
    height: '73M',
    region: 'ASIA',
    image: 'videos/영상 6개 대표이미지/타지마할.png',
    video: 'videos/영상 6개/tajmahal_4k.mp4',
    youtube: 'https://youtu.be/m5yha6koeW0', // YouTube URL 또는 영상 ID 입력
  },
};

const buildModalShell = buildModal?.querySelector('.build-modal-shell');
const buildModalHeaderTitle = document.querySelector('#buildModalHeaderTitle');
const buildModalHeroImage = document.querySelector('#buildModalHeroImage');
const buildModalCityMark = document.querySelector('#buildModalCityMark');
const buildModalSideNote = document.querySelector('#buildModalSideNote');
const buildModalCountry = document.querySelector('#buildModalCountry');
const buildModalTitle = document.querySelector('#build-modal-title');
const buildModalKo = document.querySelector('#buildModalKo');
const buildModalDescription = document.querySelector('#buildModalDescription');
const buildModalQuote = document.querySelector('#buildModalQuote');

let currentLandmarkKey = 'eiffel';
let currentModalHasVideo = true;

// 모달 통계 값 설정
function setStatValue(name, value) {
  const target = buildModal?.querySelector(`[data-stat="${name}"] strong`);
  if (target) target.textContent = value;
}

function getYouTubeEmbedUrl(value) {
  if (!value) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  if (/^[A-Za-z0-9_-]{11}$/.test(raw))
    return `https://www.youtube.com/embed/${raw}?autoplay=1&rel=0&controls=0&playsinline=1&fs=0`;
  try {
    const url = new URL(raw);
    let id = '';
    if (url.hostname.includes('youtu.be'))
      id = url.pathname.slice(1).split('/')[0];
    else if (url.pathname.startsWith('/shorts/'))
      id = url.pathname.split('/')[2];
    else if (url.pathname.startsWith('/embed/'))
      id = url.pathname.split('/')[2];
    else id = url.searchParams.get('v') || '';
    return id
      ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&controls=0&playsinline=1&fs=0`
      : '';
  } catch (_) {
    return '';
  }
}

// 랜드마크 정보를 모달에 적용
function applyLandmarkToModal(landmarkKey) {
  const data = LANDMARK_DATA[landmarkKey] || LANDMARK_DATA.eiffel;
  currentLandmarkKey = LANDMARK_DATA[landmarkKey] ? landmarkKey : 'eiffel';
  const youtubeEmbed = getYouTubeEmbedUrl(data.youtube);
  currentModalHasVideo = Boolean(youtubeEmbed || data.video);

  if (buildModalVideoStage)
    buildModalVideoStage.classList.toggle('is-youtube', Boolean(youtubeEmbed));
  if (buildModalYoutube) {
    buildModalYoutube.src = youtubeEmbed || '';
  }

  if (buildModalHeaderTitle) buildModalHeaderTitle.textContent = data.header;
  if (buildModalCountry) buildModalCountry.textContent = data.country;
  if (buildModalCityMark) buildModalCityMark.textContent = data.cityMark;
  if (buildModalSideNote) buildModalSideNote.innerHTML = data.sideNote;
  if (buildModalTitle) buildModalTitle.textContent = data.title;
  if (buildModalKo) buildModalKo.textContent = data.ko;
  if (buildModalDescription)
    buildModalDescription.textContent = data.description;
  if (buildModalQuote) buildModalQuote.textContent = data.quote;
  const collectionIndex = document.querySelector('#buildModalCollectionIndex');
  const collectionLocation = document.querySelector(
    '#buildModalCollectionLocation',
  );
  const landmarkKeys = Object.keys(LANDMARK_DATA);
  if (collectionIndex)
    collectionIndex.textContent = `${String(landmarkKeys.indexOf(currentLandmarkKey) + 1).padStart(2, '0')} / ${String(landmarkKeys.length).padStart(2, '0')}`;
  if (collectionLocation)
    collectionLocation.textContent = `${data.cityMark} · ${data.country.split(' · ')[0]}`;

  setStatValue('bricks', data.bricks);
  setStatValue('scale', data.scale);
  setStatValue('height', data.height);
  setStatValue('region', data.region);

  if (buildModalHeroImage) {
    buildModalHeroImage.src = data.image;
    buildModalHeroImage.alt = `${data.title} LEGO landmark image`;
  }

  if (buildModalVideo) {
    buildModalVideo.pause();
    buildModalVideo.currentTime = 0;
    buildModalVideo.poster = data.image;

    if (!youtubeEmbed && data.video) {
      buildModalVideo.src = data.video;
      buildModalVideo.setAttribute('src', data.video);
    } else {
      buildModalVideo.removeAttribute('src');
    }

    buildModalVideo.load();
  }

  buildModalShell?.classList.toggle('is-static-preview', !data.video);

  if (buildModalPlay) {
    buildModalPlay.disabled = !data.video;
    buildModalPlay.setAttribute(
      'aria-label',
      data.video ? '영상 재생' : '현재 랜드마크는 대표 이미지 미리보기입니다.',
    );
  }

  if (buildModalProgress) {
    buildModalProgress.setAttribute(
      'aria-disabled',
      data.video ? 'false' : 'true',
    );
    buildModalProgress.style.setProperty('--build-progress', '0%');
  }

  if (buildModalTime) {
    buildModalTime.textContent = data.video ? '00:00 / 00:00' : 'IMAGE PREVIEW';
  }
}

// 빌드 모달 열기
function openBuildModal(landmarkKey = 'eiffel') {
  if (!buildModal) return;

  applyLandmarkToModal(landmarkKey);

  buildModal.hidden = false;
  document.body.style.overflow = 'hidden';

  if (buildModalVideo && currentModalHasVideo) {
    buildModalVideo.currentTime = 0;
    safePlay(buildModalVideo);
  }
}

// 빌드 모달 닫기
function closeBuildModal() {
  if (!buildModal) return;

  if (buildModalVideo) {
    buildModalVideo.pause();
    buildModalVideo.currentTime = 0;
  }

  buildModal.hidden = true;
  document.body.style.overflow = '';

  if (currentModalHasVideo) syncBuildVideo();
}

document.querySelectorAll('.js-open-build-modal').forEach((button) => {
  button.addEventListener('click', () => {
    openBuildModal(button.dataset.landmark || 'eiffel');
  });
});

buildModalClose?.addEventListener('click', closeBuildModal);

buildModal?.addEventListener('mousedown', (event) => {
  if (event.target === buildModal) closeBuildModal();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && buildModal && !buildModal.hidden)
    closeBuildModal();
});

// 영상 시간 표시
function formatTime(time) {
  if (!Number.isFinite(time) || time < 0) return '00:00';
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// 빌드 영상 UI 동기화
function syncBuildVideo() {
  if (
    !buildModalVideo ||
    !buildModalProgress ||
    !buildModalTime ||
    !buildModalPlay
  )
    return;

  if (!currentModalHasVideo) {
    buildModalProgress.style.setProperty('--build-progress', '0%');
    buildModalTime.textContent = 'IMAGE PREVIEW';
    buildModalPlay.classList.remove('is-playing');
    return;
  }

  const duration =
    Number.isFinite(buildModalVideo.duration) && buildModalVideo.duration > 0
      ? buildModalVideo.duration
      : 0;
  const current = buildModalVideo.currentTime || 0;
  const progress = duration
    ? Math.min(100, Math.max(0, (current / duration) * 100))
    : 0;

  buildModalProgress.style.setProperty('--build-progress', `${progress}%`);
  buildModalProgress.setAttribute(
    'aria-valuemax',
    String(Math.round(duration)),
  );
  buildModalProgress.setAttribute('aria-valuenow', String(Math.round(current)));
  buildModalTime.textContent = `${formatTime(current)} / ${formatTime(duration)}`;

  const playing = !buildModalVideo.paused;
  buildModalPlay.classList.toggle('is-playing', playing);
  buildModalPlay.setAttribute(
    'aria-label',
    playing ? '영상 일시정지' : '영상 재생',
  );
}

buildModalPlay?.addEventListener('click', () => {
  if (!buildModalVideo || !currentModalHasVideo) return;
  if (buildModalVideo.paused) safePlay(buildModalVideo);
  else buildModalVideo.pause();
});

[
  'loadedmetadata',
  'durationchange',
  'loadeddata',
  'canplay',
  'timeupdate',
  'seeking',
  'seeked',
  'play',
  'pause',
  'ended',
].forEach((eventName) => {
  buildModalVideo?.addEventListener(eventName, syncBuildVideo);
});

buildModalProgress?.addEventListener('click', (event) => {
  if (
    !buildModalVideo ||
    !currentModalHasVideo ||
    !Number.isFinite(buildModalVideo.duration) ||
    buildModalVideo.duration <= 0
  )
    return;
  const rect = buildModalProgress.getBoundingClientRect();
  const ratio = Math.min(
    1,
    Math.max(0, (event.clientX - rect.left) / rect.width),
  );
  buildModalVideo.currentTime = buildModalVideo.duration * ratio;
  syncBuildVideo();
});

buildModalProgress?.addEventListener('keydown', (event) => {
  if (
    !buildModalVideo ||
    !currentModalHasVideo ||
    !Number.isFinite(buildModalVideo.duration) ||
    buildModalVideo.duration <= 0
  )
    return;
  const duration = buildModalVideo.duration;
  const step = Math.max(1, duration * 0.05);

  if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
    event.preventDefault();
    buildModalVideo.currentTime = Math.min(
      duration,
      buildModalVideo.currentTime + step,
    );
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
    event.preventDefault();
    buildModalVideo.currentTime = Math.max(
      0,
      buildModalVideo.currentTime - step,
    );
  } else if (event.key === 'Home') {
    event.preventDefault();
    buildModalVideo.currentTime = 0;
  } else if (event.key === 'End') {
    event.preventDefault();
    buildModalVideo.currentTime = duration;
  }

  syncBuildVideo();
});

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'auto' });
});

document.querySelectorAll('img, video').forEach((asset) => {
  asset.addEventListener('error', () => {
    const source = asset.currentSrc || asset.getAttribute('src');
    console.warn('[파일을 찾을 수 없음]', source);
  });
});

// CITY 스터드 패턴 정렬
function syncPinkStudPattern() {
  const citySection = document.querySelector('.closer');
  const pinkDoor = document.querySelector('.landmarks-door-top');

  if (!citySection || !pinkDoor) return;

  let studGap = 94;

  if (window.innerWidth <= 760) {
    studGap = 64;
  } else if (window.innerWidth <= 1100) {
    studGap = 82;
  }

  const cityHeight = citySection.getBoundingClientRect().height;

  const remainder = cityHeight % studGap;
  const nextStudOffset = remainder === 0 ? 0 : studGap - remainder;

  pinkDoor.style.setProperty(
    '--door-stud-offset-y',
    `${nextStudOffset.toFixed(2)}px`,
  );
}

syncPinkStudPattern();
window.addEventListener('load', syncPinkStudPattern);

let pinkStudResizeTimer = 0;

window.addEventListener('resize', () => {
  window.clearTimeout(pinkStudResizeTimer);

  pinkStudResizeTimer = window.setTimeout(() => {
    syncPinkStudPattern();
  }, 100);
});

// LANDMARKS 타이틀 모션
function setupLandmarksCopyImpact() {
  const section = document.querySelector('#landmarks');

  if (!section) return;

  if (!('IntersectionObserver' in window)) {
    section.classList.add('is-copy-impact');
    return;
  }

  let replayTimer = 0;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        window.clearTimeout(replayTimer);

        if (entry.isIntersecting) {
          section.classList.remove('is-copy-impact');

          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              section.classList.add('is-copy-impact');
            });
          });
        } else {
          replayTimer = window.setTimeout(() => {
            section.classList.remove('is-copy-impact');
          }, 180);
        }
      });
    },
    {
      root: null,
      rootMargin: '-8% 0px -18% 0px',
      threshold: 0.12,
    },
  );

  observer.observe(section);
}

setupLandmarksCopyImpact();

// 이미지 경로 예외 처리
function setupImagePathFallbacks() {
  document
    .querySelectorAll('.map-country-brick[data-asset-file]')
    .forEach((img) => {
      const file = img.dataset.assetFile;

      const candidates = [
        `images/블록 아이콘/${file}`, // 현재 확정된 폴더 구조
        `./images/블록 아이콘/${file}`,
      ];

      let index = Math.max(0, candidates.indexOf(img.getAttribute('src'))) + 1;

      img.addEventListener('error', () => {
        if (index >= candidates.length) {
          console.warn('[LEGO MAP] 블록 아이콘 경로를 찾지 못했습니다:', file);
          return;
        }

        img.src = candidates[index];
        index += 1;
      });
    });

  document
    .querySelectorAll('.about-lego-object[data-about-file]')
    .forEach((img) => {
      const file = img.dataset.aboutFile;

      const candidates = [
        `images/${file}`, // 현재 확정된 폴더 구조
        `./images/${file}`,
      ];

      let index = Math.max(0, candidates.indexOf(img.getAttribute('src'))) + 1;

      img.addEventListener('error', () => {
        if (index >= candidates.length) {
          console.warn(
            '[ABOUT LEGO] 3D 블록 이미지 경로를 찾지 못했습니다:',
            file,
          );
          return;
        }

        img.src = candidates[index];
        index += 1;
      });
    });
}

setupImagePathFallbacks();

// ABOUT 마지막 3단 브릭 크기
function setupFinalAboutStackSizing() {
  const gap = document.querySelector('#about .about-lego-gap-stack');
  const stack = document.querySelector('#about .about-lego-object-stack');
  const nextCopy = document.querySelector('#about .about-manifesto-next');

  if (!gap || !stack) return;

  let resizeTimer = 0;

  function applyFinalStackSizing() {
    const width = window.innerWidth;

    let gapHeight = '420px';
    let imageWidth = '150px';
    let imageScale = '2.925';
    let marginTop = '28px';
    let marginBottom = '10px';
    let stackTop = '42%';
    let nextCopyMarginTop = '24px';

    if (width <= 680) {
      gapHeight = '310px';
      imageWidth = '120px';
      imageScale = '2.7';
      marginTop = '18px';
      marginBottom = '8px';
      stackTop = '44%';
      nextCopyMarginTop = '18px';
    } else if (width <= 980) {
      gapHeight = '360px';
      imageWidth = '136px';
      imageScale = '2.8125';
      marginTop = '22px';
      marginBottom = '9px';
      stackTop = '43%';
      nextCopyMarginTop = '20px';
    }

    gap.style.setProperty('height', gapHeight, 'important');
    gap.style.setProperty('min-height', '0', 'important');
    gap.style.setProperty('max-height', 'none', 'important');
    gap.style.setProperty('margin-top', marginTop, 'important');
    gap.style.setProperty('margin-bottom', marginBottom, 'important');
    gap.style.setProperty('overflow', 'visible', 'important');

    stack.style.setProperty('position', 'absolute', 'important');
    stack.style.setProperty('left', '50%', 'important');
    stack.style.setProperty('top', stackTop, 'important');
    stack.style.setProperty('width', imageWidth, 'important');
    stack.style.setProperty('max-width', imageWidth, 'important');
    stack.style.setProperty('max-height', 'none', 'important');
    stack.style.setProperty('height', 'auto', 'important');
    stack.style.setProperty('margin', '0', 'important');
    stack.style.setProperty('animation', 'none', 'important');
    stack.style.setProperty(
      'transform',
      `translate(-50%, -50%) rotate(-2deg) scale(${imageScale})`,
      'important',
    );
    stack.style.setProperty('transform-origin', '50% 50%', 'important');
    stack.style.setProperty('opacity', '1', 'important');
    stack.style.setProperty('visibility', 'visible', 'important');

    if (nextCopy) {
      nextCopy.style.setProperty('margin-top', nextCopyMarginTop, 'important');
    }
  }

  applyFinalStackSizing();

  window.addEventListener('load', applyFinalStackSizing);
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(applyFinalStackSizing, 100);
  });
}

setupFinalAboutStackSizing();

// ABOUT 텍스트 스크롤 모션
function setupAppleAboutTextMotion() {
  const section = document.querySelector('#about.about-manifesto');
  if (!section) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const motionGroups = [
    {
      selector: '.about-manifesto-block-intro h2',
      mode: 'focus-rise',
      strength: 1.05,
    },
    {
      selector: '.about-manifesto-block-intro .about-manifesto-lead',
      mode: 'mask-rise',
      strength: 1.0,
    },
    {
      selector: '.about-manifesto-block-intro > p:last-child',
      mode: 'soft-rise',
      strength: 0.9,
    },

    {
      selector: '.about-manifesto-block:nth-of-type(2) > p',
      mode: 'drift-left',
      strength: 0.9,
    },
    {
      selector: '.about-manifesto-highlight-yellow',
      mode: 'focus-scale',
      strength: 1.05,
    },

    {
      selector: '.about-manifesto-block:nth-of-type(3) > p:first-child',
      mode: 'drift-right',
      strength: 0.88,
    },
    {
      selector: '.about-manifesto-block:nth-of-type(3) > h3',
      mode: 'mask-rise',
      strength: 1.0,
    },
    {
      selector: '.about-manifesto-block:nth-of-type(3) > p:last-child',
      mode: 'soft-rise',
      strength: 0.85,
    },

    {
      selector: '.about-manifesto-block-process > p:first-child',
      mode: 'soft-rise',
      strength: 0.92,
    },
    {
      selector: '.about-manifesto-process > span',
      mode: 'line-stagger',
      strength: 1.0,
    },
    {
      selector: '.about-manifesto-block-process > p:last-child',
      mode: 'focus-rise',
      strength: 0.85,
    },

    {
      selector: '.about-manifesto-kicker',
      mode: 'soft-fade',
      strength: 0.8,
    },
    {
      selector: '.about-manifesto-finale > h2',
      mode: 'focus-scale',
      strength: 1.02,
    },
    {
      selector: '.about-manifesto-your-way > i',
      mode: 'letter-pop',
      strength: 0.8,
    },
    {
      selector: '.about-manifesto-turn',
      mode: 'mask-rise',
      strength: 0.95,
    },
  ];

  const items = [];

  motionGroups.forEach((group) => {
    section.querySelectorAll(group.selector).forEach((element, localIndex) => {
      element.classList.add('apple-scroll-copy');

      items.push({
        element,
        mode: group.mode,
        strength: group.strength ?? 1,
        localIndex,
      });
    });
  });

  if (items.length === 0) return;

  section.classList.add('apple-cinematic-motion');

  const uniqueItems = [];
  const seen = new Set();

  items.forEach((item) => {
    if (seen.has(item.element)) return;
    seen.add(item.element);
    uniqueItems.push(item);
  });

  const clamp = (value, min = 0, max = 1) =>
    Math.min(max, Math.max(min, value));

  const smoothStep = (value) => {
    const t = clamp(value);
    return t * t * (3 - 2 * t);
  };

  let rafId = 0;

  function applyMotion() {
    rafId = 0;

    if (reduceMotion.matches) {
      uniqueItems.forEach(({ element }) => {
        element.style.setProperty('--apple-opacity', '1');
        element.style.setProperty('--apple-x', '0px');
        element.style.setProperty('--apple-y', '0px');
        element.style.setProperty('--apple-scale', '1');
        element.style.setProperty('--apple-rotate', '0deg');
        element.style.setProperty('--apple-blur', '0px');
        element.style.setProperty('--apple-clip-top', '0%');
        element.style.setProperty('--apple-clip-bottom', '0%');
      });
      return;
    }

    const viewportHeight = Math.max(window.innerHeight, 1);

    uniqueItems.forEach((item, index) => {
      const { element, mode, strength, localIndex } = item;
      const rect = element.getBoundingClientRect();

      let centerN = (rect.top + rect.height * 0.5) / viewportHeight;

      const stagger =
        mode === 'line-stagger'
          ? localIndex * 0.026
          : mode === 'letter-pop'
            ? localIndex * 0.014
            : 0;

      centerN += stagger;

      const enter = smoothStep((0.94 - centerN) / 0.29);

      const exit = smoothStep((centerN - 0.05) / 0.23);

      const visible = clamp(Math.min(enter, exit));

      const direction = centerN >= 0.5 ? 1 : -1;
      const hidden = 1 - visible;

      let x = 0;
      let y = 0;
      let scale = 1;
      let rotate = 0;
      let blur = 0;
      let clipTop = 0;
      let clipBottom = 0;

      switch (mode) {
        case 'focus-rise':
          y = direction * hidden * 34 * strength;
          scale = 0.965 + visible * 0.035;
          blur = hidden * 11;
          break;

        case 'mask-rise':
          y = direction * hidden * 24 * strength;
          scale = 0.982 + visible * 0.018;
          blur = hidden * 7;
          if (direction > 0) {
            clipTop = hidden * 22;
          } else {
            clipBottom = hidden * 22;
          }
          break;

        case 'soft-rise':
          y = direction * hidden * 22 * strength;
          scale = 0.985 + visible * 0.015;
          blur = hidden * 8;
          break;

        case 'drift-left':
          x = -hidden * 28 * strength;
          y = direction * hidden * 10;
          scale = 0.99 + visible * 0.01;
          blur = hidden * 8;
          break;

        case 'drift-right':
          x = hidden * 28 * strength;
          y = direction * hidden * 10;
          scale = 0.99 + visible * 0.01;
          blur = hidden * 8;
          break;

        case 'focus-scale':
          y = direction * hidden * 14 * strength;
          scale = 0.935 + visible * 0.065;
          blur = hidden * 10;
          break;

        case 'line-stagger':
          x = hidden * (localIndex % 2 === 0 ? -18 : 18);
          y = direction * hidden * (28 + localIndex * 2);
          scale = 0.97 + visible * 0.03;
          blur = hidden * 8;
          clipTop = direction > 0 ? hidden * 15 : 0;
          clipBottom = direction < 0 ? hidden * 15 : 0;
          break;

        case 'letter-pop':
          y = direction * hidden * (14 + localIndex * 1.5);
          scale = 0.82 + visible * 0.18;
          rotate = (localIndex % 2 === 0 ? -1 : 1) * hidden * 2.4;
          blur = hidden * 5;
          break;

        case 'soft-fade':
        default:
          y = direction * hidden * 12;
          scale = 0.99 + visible * 0.01;
          blur = hidden * 6;
          break;
      }

      element.style.setProperty('--apple-opacity', visible.toFixed(3));
      element.style.setProperty('--apple-x', `${x.toFixed(2)}px`);
      element.style.setProperty('--apple-y', `${y.toFixed(2)}px`);
      element.style.setProperty('--apple-scale', scale.toFixed(4));
      element.style.setProperty('--apple-rotate', `${rotate.toFixed(2)}deg`);
      element.style.setProperty('--apple-blur', `${blur.toFixed(2)}px`);
      element.style.setProperty('--apple-clip-top', `${clipTop.toFixed(2)}%`);
      element.style.setProperty(
        '--apple-clip-bottom',
        `${clipBottom.toFixed(2)}%`,
      );
    });
  }

  function requestMotionFrame() {
    if (rafId) return;

    rafId = requestAnimationFrame(applyMotion);
  }

  applyMotion();

  window.addEventListener('scroll', requestMotionFrame, { passive: true });
  window.addEventListener('resize', requestMotionFrame);
  window.addEventListener('load', requestMotionFrame);
  reduceMotion.addEventListener?.('change', requestMotionFrame);
}

setupAppleAboutTextMotion();

// LANDMARKS 영상 시네마틱 효과
function setupLandmarksCinematicFocus() {
  const section = document.querySelector('#landmarks');
  const stage = section?.querySelector('.landmarks-sticky');
  const video = section?.querySelector('#landmarksVideo');

  if (!section || !stage || !video) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let rafId = 0;
  let activePass = false;
  let titleSequenceActive = false;
  let videoFocusActive = false;

  const clamp01 = (value) => Math.min(1, Math.max(0, value));

  const smoothStep = (value) => {
    const t = clamp01(value);
    return t * t * (3 - 2 * t);
  };

  const rangeProgress = (value, start, end) =>
    smoothStep((value - start) / (end - start));

  function cssRevealDistancePx() {
    const raw = getComputedStyle(section)
      .getPropertyValue('--landmarks-reveal-scroll')
      .trim();

    if (raw.endsWith('vh')) {
      const value = Number.parseFloat(raw);
      if (Number.isFinite(value)) {
        return Math.max(1, (window.innerHeight * value) / 100);
      }
    }

    if (raw.endsWith('px')) {
      const value = Number.parseFloat(raw);
      if (Number.isFinite(value)) {
        return Math.max(1, value);
      }
    }

    return Math.max(1, window.innerHeight * 0.82);
  }

  function replayClass(className) {
    stage.classList.remove(className);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        stage.classList.add(className);
      });
    });
  }

  function updateCinematic() {
    rafId = 0;

    const scrollY = window.scrollY;
    const viewportWidth = window.innerWidth;
    const navHeight = viewportWidth <= 980 ? 74 : 86;

    const stageHeight = stage.offsetHeight;
    const sectionRect = section.getBoundingClientRect();
    const sectionTop = scrollY + sectionRect.top;

    const stageTop = navHeight;
    const pinStart = sectionTop - stageTop;
    const pinEnd = sectionTop + section.offsetHeight - stageHeight - stageTop;

    const revealTravel = Math.min(
      Math.max(1, pinEnd - pinStart),
      cssRevealDistancePx(),
    );

    const progress = clamp01((scrollY - pinStart) / Math.max(1, revealTravel));

    const insidePinnedScene = scrollY >= pinStart && scrollY <= pinEnd;

    if (insidePinnedScene && !activePass) {
      activePass = true;

      try {
        video.currentTime = 0;
      } catch (_) {}

      video.playbackRate = 0.88;

      const playPromise = video.play();
      if (playPromise?.catch) {
        playPromise.catch(() => {});
      }
    }

    if (!insidePinnedScene && activePass) {
      activePass = false;
      video.playbackRate = 1;
    }

    if (reduceMotion.matches) {
      stage.classList.remove(
        'is-title-cinematic',
        'is-title-fading',
        'is-video-focus',
      );

      section.style.setProperty('--landmarks-line-one-x', '0px');
      section.style.setProperty('--landmarks-line-two-x', '0px');
      section.style.setProperty('--landmarks-line-one-scale', '1');
      section.style.setProperty('--landmarks-line-two-scale', '1');
      section.style.setProperty('--landmarks-line-one-blur', '0px');
      section.style.setProperty('--landmarks-line-two-blur', '0px');

      section.style.setProperty('--landmarks-video-scale', '1');
      section.style.setProperty('--landmarks-video-brightness', '1');
      section.style.setProperty('--landmarks-video-saturation', '1');
      section.style.setProperty('--landmarks-video-contrast', '1');
      section.style.setProperty('--landmarks-video-blur', '0px');
      section.style.setProperty('--landmarks-overlay-opacity', '.22');

      return;
    }

    const lineOne = rangeProgress(progress, 0.38, 0.6);

    const lineOneX = -84 * (1 - lineOne);

    const lineOneY = 48 * (1 - lineOne);

    const lineOneScale = 0.9 + lineOne * 0.1;

    const lineOneBlur = 12 * (1 - lineOne);

    const lineOneTracking = 0.075 + lineOne * -0.14;

    section.style.setProperty('--landmarks-line-one-opacity', String(lineOne));

    section.style.setProperty(
      '--landmarks-line-one-x',
      `${lineOneX.toFixed(1)}px`,
    );

    section.style.setProperty(
      '--landmarks-line-one-y',
      `${lineOneY.toFixed(1)}px`,
    );

    section.style.setProperty(
      '--landmarks-line-one-scale',
      lineOneScale.toFixed(4),
    );

    section.style.setProperty(
      '--landmarks-line-one-blur',
      `${lineOneBlur.toFixed(2)}px`,
    );

    section.style.setProperty(
      '--landmarks-line-one-tracking',
      `${lineOneTracking.toFixed(4)}em`,
    );

    section.style.setProperty(
      '--landmarks-line-one-clip',
      `${((1 - lineOne) * 68).toFixed(2)}%`,
    );

    const lineTwo = rangeProgress(progress, 0.54, 0.76);

    const lineTwoX = 96 * (1 - lineTwo);

    const lineTwoY = 54 * (1 - lineTwo);

    const lineTwoScale = 0.86 + lineTwo * 0.14;

    const lineTwoBlur = 14 * (1 - lineTwo);

    const lineTwoTracking = 0.055 + lineTwo * -0.12;

    section.style.setProperty('--landmarks-line-two-opacity', String(lineTwo));

    section.style.setProperty(
      '--landmarks-line-two-x',
      `${lineTwoX.toFixed(1)}px`,
    );

    section.style.setProperty(
      '--landmarks-line-two-y',
      `${lineTwoY.toFixed(1)}px`,
    );

    section.style.setProperty(
      '--landmarks-line-two-scale',
      lineTwoScale.toFixed(4),
    );

    section.style.setProperty(
      '--landmarks-line-two-blur',
      `${lineTwoBlur.toFixed(2)}px`,
    );

    section.style.setProperty(
      '--landmarks-line-two-tracking',
      `${lineTwoTracking.toFixed(4)}em`,
    );

    section.style.setProperty(
      '--landmarks-line-two-clip',
      `${((1 - lineTwo) * 68).toFixed(2)}%`,
    );

    const shouldRunTitleSequence = progress >= 0.56 && progress < 0.93;

    if (shouldRunTitleSequence && !titleSequenceActive) {
      titleSequenceActive = true;
      replayClass('is-title-cinematic');
    }

    if (progress < 0.34) {
      titleSequenceActive = false;
      stage.classList.remove('is-title-cinematic');
    }

    const videoFocus = rangeProgress(progress, 0.32, 0.8);

    const videoScale = 1.04 - videoFocus * 0.026;

    const videoBrightness = 0.84 + videoFocus * 0.16;

    const videoSaturation = 0.82 + videoFocus * 0.18;

    const videoContrast = 0.94 + videoFocus * 0.06;

    const videoBlur = 2.2 * (1 - videoFocus);

    const overlayOpacity = 0.7 - videoFocus * 0.38;

    section.style.setProperty('--landmarks-video-scale', videoScale.toFixed(4));

    section.style.setProperty(
      '--landmarks-video-brightness',
      videoBrightness.toFixed(3),
    );

    section.style.setProperty(
      '--landmarks-video-saturation',
      videoSaturation.toFixed(3),
    );

    section.style.setProperty(
      '--landmarks-video-contrast',
      videoContrast.toFixed(3),
    );

    section.style.setProperty(
      '--landmarks-video-blur',
      `${videoBlur.toFixed(2)}px`,
    );

    section.style.setProperty(
      '--landmarks-overlay-opacity',
      overlayOpacity.toFixed(3),
    );

    const shouldFocusVideo = progress >= 0.78;

    if (shouldFocusVideo && !videoFocusActive) {
      videoFocusActive = true;
      replayClass('is-video-focus');
    }

    if (progress < 0.66) {
      videoFocusActive = false;
      stage.classList.remove('is-video-focus');
    }

    if (progress >= 0.88) {
      stage.classList.add('is-title-fading');
    } else if (progress < 0.84) {
      stage.classList.remove('is-title-fading');
    }
  }

  function requestCinematicUpdate() {
    if (rafId) return;

    rafId = requestAnimationFrame(updateCinematic);
  }

  updateCinematic();

  window.addEventListener('scroll', requestCinematicUpdate, { passive: true });

  window.addEventListener('resize', requestCinematicUpdate);

  window.addEventListener('load', requestCinematicUpdate);

  reduceMotion.addEventListener?.('change', requestCinematicUpdate);
}

setupLandmarksCinematicFocus();

// WORLD TRAVEL 영상 문 애니메이션
function setupTravelInterlude() {
  const section = document.querySelector('#travelInterlude');
  const video = document.querySelector('#travelInterludeVideo');

  if (!section || !video) return;

  if (video instanceof HTMLVideoElement) {
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const clamp01 = (value) => Math.min(1, Math.max(0, value));

  const smoothStep = (value) => {
    const t = clamp01(value);
    return t * t * (3 - 2 * t);
  };

  const range = (value, start, end) =>
    smoothStep((value - start) / (end - start));

  let rafId = 0;
  let wasVisible = false;

  function updateTravelInterlude() {
    rafId = 0;

    const rect = section.getBoundingClientRect();
    const viewportHeight = Math.max(window.innerHeight, 1);
    const scrollDistance = Math.max(section.offsetHeight - viewportHeight, 1);

    const progress = clamp01(-rect.top / scrollDistance);

    if (reduceMotion.matches) {
      section.style.setProperty('--travel-open', '106');
      section.style.setProperty('--travel-copy', '1');
      section.style.setProperty('--travel-copy-y', '0px');
      section.style.setProperty('--travel-copy-blur', '0px');
      section.style.setProperty('--travel-video-scale', '1');
      section.style.setProperty('--travel-video-blur', '0px');
      section.style.setProperty('--travel-video-brightness', '.94');
      section.style.setProperty('--travel-cities', '1');
    } else {
      const open = range(progress, 0.04, 0.36);

      section.style.setProperty('--travel-open', (open * 106).toFixed(2));

      const focus = range(progress, 0.08, 0.47);

      section.style.setProperty(
        '--travel-video-scale',
        (1.06 - focus * 0.055).toFixed(4),
      );

      section.style.setProperty(
        '--travel-video-blur',
        `${(4.2 * (1 - focus)).toFixed(2)}px`,
      );

      section.style.setProperty(
        '--travel-video-brightness',
        (0.76 + focus * 0.2).toFixed(3),
      );

      const copyIn = range(progress, 0.25, 0.45);

      const copyOut = 1 - range(progress, 0.7, 0.84);

      const copy = clamp01(Math.min(copyIn, copyOut));

      section.style.setProperty('--travel-copy', copy.toFixed(3));

      section.style.setProperty(
        '--travel-copy-y',
        `${((1 - copy) * 34).toFixed(2)}px`,
      );

      section.style.setProperty(
        '--travel-copy-blur',
        `${((1 - copy) * 10).toFixed(2)}px`,
      );

      const citiesIn = range(progress, 0.72, 0.86);

      const citiesOut = 1 - range(progress, 0.96, 1);

      section.style.setProperty(
        '--travel-cities',
        clamp01(Math.min(citiesIn, citiesOut)).toFixed(3),
      );
    }

    const visible = rect.bottom > 0 && rect.top < viewportHeight;

    if (visible && !wasVisible) {
      wasVisible = true;

      /* YouTube iframe은 HTMLVideoElement API를 사용할 수 없음 */
      if (video instanceof HTMLVideoElement) {
        try {
          video.currentTime = 0;
        } catch (_) {}

        video.playbackRate = 0.94;

        const result = video.play();
        if (result?.catch) result.catch(() => {});
      }
    }

    if (!visible && wasVisible) {
      wasVisible = false;

      if (video instanceof HTMLVideoElement) {
        video.pause();
        video.playbackRate = 1;
      }
    }
  }

  function requestTravelUpdate() {
    if (rafId) return;

    rafId = requestAnimationFrame(updateTravelInterlude);
  }

  const playIfPossible = () => {
    if (!(video instanceof HTMLVideoElement)) return;

    video.muted = true;
    const result = video.play();
    if (result?.catch) result.catch(() => {});
  };

  if (video instanceof HTMLVideoElement)
    video.addEventListener('canplay', playIfPossible);
  if (video instanceof HTMLVideoElement)
    video.addEventListener('loadeddata', requestTravelUpdate);

  updateTravelInterlude();

  window.addEventListener('scroll', requestTravelUpdate, { passive: true });

  window.addEventListener('resize', requestTravelUpdate);

  window.addEventListener('load', requestTravelUpdate);

  reduceMotion.addEventListener?.('change', requestTravelUpdate);
}

setupTravelInterlude();

// 스크롤 촤라락
function setupScrollCascade() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const items = [];
  const registered = new Set();

  function addElement(element, type = 'up', delay = 0) {
    if (!element || registered.has(element)) return;

    registered.add(element);

    element.classList.add('scroll-cascade-item', `scroll-cascade-${type}`);

    element.style.setProperty('--cascade-delay', `${Math.max(0, delay)}ms`);

    items.push(element);
  }

  function addGroup(selector, type = 'up', step = 70, start = 0) {
    document.querySelectorAll(selector).forEach((element, index) => {
      addElement(element, type, start + index * step);
    });
  }

  // PROCESS
  addElement(document.querySelector('#build .process-copy-column'), 'left', 0);

  addGroup('#build .process-card', 'up', 75, 70);

  // CITY
  addElement(document.querySelector('.closer-top .media-block'), 'left', 0);

  addElement(document.querySelector('.closer-copy'), 'right', 100);

  addGroup('.city-card-showcase .city-polaroid-card', 'up', 90, 0);

  addElement(document.querySelector('.city-kinetic-kicker'), 'up', 0);

  addElement(document.querySelector('.city-kinetic-title'), 'zoom', 70);

  addElement(document.querySelector('.city-kinetic-description'), 'up', 140);

  // MAP
  const mapHeading = document.querySelector('#map .section-heading');
  if (mapHeading) {
    addElement(mapHeading.children[0], 'left', 0);
    addElement(mapHeading.children[1], 'right', 90);
  }

  addElement(document.querySelector('#map .map-card'), 'zoom', 80);

  addGroup('#map .map-landmark-button', 'up', 65, 40);

  // GALLERY
  addElement(document.querySelector('#gallery .gallery-head'), 'up', 0);

  addGroup('#gallery .gallery-tile', 'up', 75, 60);

  // FOOTER
  addGroup('footer#contact > *', 'up', 70, 0);

  if (!items.length) return;

  document.documentElement.classList.add('scroll-cascade-enabled');

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    items.forEach((item) => {
      item.classList.add('is-revealed');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const element = entry.target;
        element.classList.add('is-revealed');
        observer.unobserve(element);

        const cleanup = (event) => {
          if (event.animationName !== 'scroll-cascade-reveal') return;

          element.classList.remove(
            'scroll-cascade-item',
            'scroll-cascade-left',
            'scroll-cascade-right',
            'scroll-cascade-up',
            'scroll-cascade-zoom',
            'is-revealed',
          );

          element.style.removeProperty('--cascade-delay');

          element.removeEventListener('animationend', cleanup);
        };

        element.addEventListener('animationend', cleanup);
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -8% 0px',
    },
  );

  items.forEach((item) => {
    observer.observe(item);
  });
}

setupScrollCascade();
