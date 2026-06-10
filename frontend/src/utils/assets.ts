const R2_BASE_URL = import.meta.env.VITE_R2_ASSETS_URL || 'https://pub-f243a32e4dee45969b6714c325a336f8.r2.dev';

export const ASSETS = {
  logo: '/images/Logo.png',
  storytelling: {
    story: `${R2_BASE_URL}/Story%20Telling/story.png`,
    impact: `${R2_BASE_URL}/Story%20Telling/impact.png`,
  },
  story: {
    first: `${R2_BASE_URL}/Story/First.png`,
    legacy: `${R2_BASE_URL}/Story/Legacy.png`,
    history: `${R2_BASE_URL}/Story/History.png`,
    story: `${R2_BASE_URL}/Story/Story.png`,
    larasana: `${R2_BASE_URL}/Story/LARASANA.png`,
  },
  loginRegister: {
    bg: `${R2_BASE_URL}/login-register/33d7e2776de4144419b5c6d0a2dc6544-Photoroom.png`,
  },
  impact: {
    hhi: `${R2_BASE_URL}/impact/HHI.png`,
    social: `${R2_BASE_URL}/impact/Social.png`,
    unesco: `${R2_BASE_URL}/impact/UNESCO.png`,
    wfi: `${R2_BASE_URL}/impact/WFI.png`,
    ycab: `${R2_BASE_URL}/impact/YCAB.png`,
    education: `${R2_BASE_URL}/impact/education.png`,
    regeneration: `${R2_BASE_URL}/impact/regeneration.png`,
    nausea: `${R2_BASE_URL}/impact/NAUSEA.png`,
    maxmara: `${R2_BASE_URL}/impact/MAXMARA.png`,
    constelation: `${R2_BASE_URL}/impact/CONSTELATION.png`,
  },
  aboutUs: {
    first: `${R2_BASE_URL}/About%20Us/First.png`,
    second: `${R2_BASE_URL}/About%20Us/Second.png`,
    fawwaz: `${R2_BASE_URL}/About%20Us/Fawwaz.png`,
    sheva: `${R2_BASE_URL}/About%20Us/anak%20agung%20sheva.png`,
    nauval: `${R2_BASE_URL}/About%20Us/nauval.png`,
    faruk: `${R2_BASE_URL}/About%20Us/faruk.png`,
    joel: `${R2_BASE_URL}/About%20Us/joel.png`,
    apis: `${R2_BASE_URL}/About%20Us/apis.png`,
  },
};
