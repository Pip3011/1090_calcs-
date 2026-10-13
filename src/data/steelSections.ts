import { SteelSection, ShackleRating, SteelGrade } from '../types';

export const STEEL_GRADES: Record<SteelGrade, { name: string; fy: number; fu: number; standard: string }> = {
  S235: { name: 'S235 (EN 10025-2)', fy: 235, fu: 360, standard: 'EN 10025-2' },
  S275: { name: 'S275 (EN 10025-2)', fy: 275, fu: 430, standard: 'EN 10025-2' },
  S355: { name: 'S355 (EN 10025-2)', fy: 355, fu: 510, standard: 'EN 10025-2' },
  S460: { name: 'S460 (EN 10025-3)', fy: 460, fu: 550, standard: 'EN 10025-3' },
};

export const STANDARD_SECTIONS: SteelSection[] = [
  {
    id: 'ub-457-191-67',
    designation: 'UB 457 × 191 × 67',
    category: 'UB',
    depth: 453.4,
    width: 189.9,
    webThickness: 8.5,
    flangeThickness: 12.7,
    massPerMeter: 67.1,
    area: 85.5,
    secondMomentOfAreaY: 29380,
    plasticSectionModulusY: 1453,
    elasticSectionModulusY: 1296,
  },
  {
    id: 'ub-406-178-54',
    designation: 'UB 406 × 178 × 54',
    category: 'UB',
    depth: 402.6,
    width: 177.7,
    webThickness: 7.7,
    flangeThickness: 10.9,
    massPerMeter: 54.1,
    area: 69.0,
    secondMomentOfAreaY: 18720,
    plasticSectionModulusY: 1055,
    elasticSectionModulusY: 930,
  },
  {
    id: 'ub-356-171-45',
    designation: 'UB 356 × 171 × 45',
    category: 'UB',
    depth: 351.4,
    width: 171.1,
    webThickness: 7.0,
    flangeThickness: 9.7,
    massPerMeter: 45.0,
    area: 57.3,
    secondMomentOfAreaY: 12070,
    plasticSectionModulusY: 775,
    elasticSectionModulusY: 687,
  },
  {
    id: 'ub-305-165-40',
    designation: 'UB 305 × 165 × 40',
    category: 'UB',
    depth: 303.4,
    width: 165.0,
    webThickness: 6.0,
    flangeThickness: 10.2,
    massPerMeter: 40.3,
    area: 51.3,
    secondMomentOfAreaY: 8503,
    plasticSectionModulusY: 623,
    elasticSectionModulusY: 561,
  },
  {
    id: 'ub-254-146-31',
    designation: 'UB 254 × 146 × 31',
    category: 'UB',
    depth: 251.4,
    width: 146.1,
    webThickness: 6.0,
    flangeThickness: 8.6,
    massPerMeter: 31.1,
    area: 39.7,
    secondMomentOfAreaY: 4413,
    plasticSectionModulusY: 395,
    elasticSectionModulusY: 351,
  },
  {
    id: 'ub-203-133-25',
    designation: 'UB 203 × 133 × 25',
    category: 'UB',
    depth: 203.2,
    width: 133.2,
    webThickness: 5.7,
    flangeThickness: 7.8,
    massPerMeter: 25.1,
    area: 32.0,
    secondMomentOfAreaY: 2340,
    plasticSectionModulusY: 258,
    elasticSectionModulusY: 230,
  },
  {
    id: 'uc-203-203-46',
    designation: 'UC 203 × 203 × 46',
    category: 'UC',
    depth: 203.2,
    width: 203.6,
    webThickness: 7.2,
    flangeThickness: 11.0,
    massPerMeter: 46.1,
    area: 58.7,
    secondMomentOfAreaY: 4568,
    plasticSectionModulusY: 497,
    elasticSectionModulusY: 450,
  },
  {
    id: 'shs-200-200-5',
    designation: 'SHS 200 × 200 × 5.0',
    category: 'SHS',
    depth: 200,
    width: 200,
    webThickness: 5.0,
    flangeThickness: 5.0,
    massPerMeter: 30.1,
    area: 38.4,
    secondMomentOfAreaY: 2473,
    plasticSectionModulusY: 285,
    elasticSectionModulusY: 247,
  },
  {
    id: 'shs-150-150-6',
    designation: 'SHS 150 × 150 × 6.3',
    category: 'SHS',
    depth: 150,
    width: 150,
    webThickness: 6.3,
    flangeThickness: 6.3,
    massPerMeter: 28.3,
    area: 36.1,
    secondMomentOfAreaY: 1260,
    plasticSectionModulusY: 197,
    elasticSectionModulusY: 168,
  },
  {
    id: 'rhs-200-100-6',
    designation: 'RHS 200 × 100 × 6.3',
    category: 'RHS',
    depth: 200,
    width: 100,
    webThickness: 6.3,
    flangeThickness: 6.3,
    massPerMeter: 28.3,
    area: 36.1,
    secondMomentOfAreaY: 1880,
    plasticSectionModulusY: 232,
    elasticSectionModulusY: 188,
  },
  {
    id: 'chs-168-6',
    designation: 'CHS 168.3 × 6.3',
    category: 'CHS',
    depth: 168.3,
    width: 168.3,
    webThickness: 6.3,
    flangeThickness: 6.3,
    massPerMeter: 25.2,
    area: 32.1,
    secondMomentOfAreaY: 1060,
    plasticSectionModulusY: 167,
    elasticSectionModulusY: 126,
  },
];

export function calculateSectionProperties(params: {
  designation: string;
  category: 'UB' | 'UC' | 'PFC' | 'RHS' | 'SHS' | 'CHS' | 'CUSTOM';
  depth: number; // h in mm
  width: number; // b in mm
  webThickness: number; // tw in mm
  flangeThickness: number; // tf in mm
}): SteelSection {
  const { designation, category, depth: h, width: b, webThickness: tw, flangeThickness: tf } = params;

  let areaCm2 = 0;
  let massKgM = 0;
  let iyCm4 = 0;
  let welyCm3 = 0;
  let wplyCm3 = 0;

  if (category === 'SHS' || category === 'RHS') {
    // Hollow rectangular/square section
    // Outer dimensions: b, h; thickness: t = tw
    const t = tw > 0 ? tw : tf;
    const bInner = Math.max(1, b - 2 * t);
    const hInner = Math.max(1, h - 2 * t);
    
    // Area in mm2 = b*h - bInner*hInner
    const areaMm2 = (b * h) - (bInner * hInner);
    areaCm2 = areaMm2 / 100;
    massKgM = areaCm2 * 0.785; // rho = 7850 kg/m3

    // Iy in mm4 = (b*h^3 - bInner*hInner^3) / 12
    const iyMm4 = (b * Math.pow(h, 3) - bInner * Math.pow(hInner, 3)) / 12;
    iyCm4 = iyMm4 / 1e4;
    welyCm3 = (iyMm4 / (h / 2)) / 1e3;

    // Wpl,y in mm3 = (b*h^2 - bInner*hInner^2) / 4
    const wplyMm3 = (b * Math.pow(h, 2) - bInner * Math.pow(hInner, 2)) / 4;
    wplyCm3 = wplyMm3 / 1e3;
  } else if (category === 'CHS') {
    // Circular hollow section: diameter d = depth, thickness t = webThickness
    const d = h;
    const t = tw;
    const dInner = Math.max(1, d - 2 * t);
    const areaMm2 = (Math.PI / 4) * (Math.pow(d, 2) - Math.pow(dInner, 2));
    areaCm2 = areaMm2 / 100;
    massKgM = areaCm2 * 0.785;

    const iyMm4 = (Math.PI / 64) * (Math.pow(d, 4) - Math.pow(dInner, 4));
    iyCm4 = iyMm4 / 1e4;
    welyCm3 = (iyMm4 / (d / 2)) / 1e3;
    const wplyMm3 = (Math.pow(d, 3) - Math.pow(dInner, 3)) / 6;
    wplyCm3 = wplyMm3 / 1e3;
  } else {
    // I / H section (UB, UC, Plate Girder, CUSTOM)
    const hw = Math.max(1, h - 2 * tf);
    const areaMm2 = 2 * (b * tf) + (hw * tw);
    areaCm2 = areaMm2 / 100;
    massKgM = areaCm2 * 0.785;

    // Iy = (b*h^3 - (b - tw)*hw^3) / 12
    const iyMm4 = (b * Math.pow(h, 3) - (b - tw) * Math.pow(hw, 3)) / 12;
    iyCm4 = iyMm4 / 1e4;
    welyCm3 = (iyMm4 / (h / 2)) / 1e3;

    // Wpl,y = b*tf*(h - tf) + tw*hw^2 / 4
    const wplyMm3 = b * tf * (h - tf) + (tw * Math.pow(hw, 2)) / 4;
    wplyCm3 = wplyMm3 / 1e3;
  }

  return {
    id: `custom-${designation.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
    designation: designation || `Custom ${category} ${h}×${b}×${tw}`,
    category,
    depth: h,
    width: b,
    webThickness: tw,
    flangeThickness: tf,
    massPerMeter: Number(massKgM.toFixed(1)),
    area: Number(areaCm2.toFixed(1)),
    secondMomentOfAreaY: Number(iyCm4.toFixed(1)),
    plasticSectionModulusY: Number(wplyCm3.toFixed(1)),
    elasticSectionModulusY: Number(welyCm3.toFixed(1)),
  };
}

export const SHACKLE_CATALOG: ShackleRating[] = [
  { wllTonnes: 1.0, pinDiameterMm: 11, jawWidthMm: 17, bowDiameterMm: 10, nominalSizeInch: '3/8"' },
  { wllTonnes: 2.0, pinDiameterMm: 16, jawWidthMm: 21, bowDiameterMm: 13, nominalSizeInch: '1/2"' },
  { wllTonnes: 3.25, pinDiameterMm: 19, jawWidthMm: 27, bowDiameterMm: 16, nominalSizeInch: '5/8"' },
  { wllTonnes: 4.75, pinDiameterMm: 22, jawWidthMm: 31, bowDiameterMm: 19, nominalSizeInch: '3/4"' },
  { wllTonnes: 6.5, pinDiameterMm: 25, jawWidthMm: 36, bowDiameterMm: 22, nominalSizeInch: '7/8"' },
  { wllTonnes: 8.5, pinDiameterMm: 28, jawWidthMm: 43, bowDiameterMm: 25, nominalSizeInch: '1"' },
  { wllTonnes: 9.5, pinDiameterMm: 32, jawWidthMm: 47, bowDiameterMm: 28, nominalSizeInch: '1-1/8"' },
  { wllTonnes: 12.0, pinDiameterMm: 35, jawWidthMm: 51, bowDiameterMm: 32, nominalSizeInch: '1-1/4"' },
  { wllTonnes: 17.0, pinDiameterMm: 42, jawWidthMm: 60, bowDiameterMm: 38, nominalSizeInch: '1-1/2"' },
  { wllTonnes: 25.0, pinDiameterMm: 50, jawWidthMm: 74, bowDiameterMm: 45, nominalSizeInch: '1-3/4"' },
  { wllTonnes: 35.0, pinDiameterMm: 57, jawWidthMm: 83, bowDiameterMm: 50, nominalSizeInch: '2"' },
  { wllTonnes: 55.0, pinDiameterMm: 70, jawWidthMm: 105, bowDiameterMm: 65, nominalSizeInch: '2-1/2"' },
];
