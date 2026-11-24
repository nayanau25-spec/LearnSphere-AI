import type {AchievementBadge, Lesson, Question, SubjectId} from './types';

export const SUBJECT_METADATA: Record<
  SubjectId,
  {
    id: SubjectId;
    name: {en: string; kn: string};
    subtitle: {en: string; kn: string};
    image: string;
  }
> = {
  mathematics: {
    id: 'mathematics',
    name: {en: 'Mathematics', kn: 'ಗಣಿತ'},
    subtitle: {
      en: 'Fractions, Linear Equations, and Plane Geometry',
      kn: 'ಭಿನ್ನರಾಶಿಗಳು, ರೇಖೀಯ ಸಮೀಕರಣಗಳು ಮತ್ತು ರೇಖಾಗಣಿತ',
    },
    image: '/src/assets/images/subject_mathematics_visual_1795542143759.jpg',
  },
  science: {
    id: 'science',
    name: {en: 'Science', kn: 'ವಿಜ್ಞಾನ'},
    subtitle: {
      en: 'Plant Biology, Circuits & Energy, and Matter',
      kn: 'ಸಸ್ಯ ಜೀವಶಾಸ್ತ್ರ, ವಿದ್ಯುತ್ ಮಂಡಲಗಳು ಮತ್ತು ದ್ರವ್ಯ',
    },
    image: '/src/assets/images/subject_science_visual_1795542144672.jpg',
  },
  english: {
    id: 'english',
    name: {en: 'English', kn: 'ಇಂಗ್ಲಿಷ್'},
    subtitle: {
      en: 'Tenses & Grammar, Reading Comprehension, and Sentence Structure',
      kn: 'ಕಾಲಗಳು ಮತ್ತು ವ್ಯಾಕರಣ, ಓದುವ ಗ್ರಹಿಕೆ ಮತ್ತು ವಾಕ್ಯ ರಚನೆ',
    },
    image: '/src/assets/images/subject_english_visual_1795542144648.jpg',
  },
};

export const ACHIEVEMENT_CATALOG: AchievementBadge[] = [
  {
    id: 'badge-first-diagnostic',
    title: {en: 'Diagnostic Explorer', kn: 'ಮೌಲ್ಯಮಾಪನ ಅನ್ವೇಷಕ'},
    description: {
      en: 'Completed your first diagnostic assessment to map topic strengths.',
      kn: 'ನಿಮ್ಮ ಮೊದಲ ಮೌಲ್ಯಮಾಪನ ಪರೀಕ್ಷೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ್ದೀರಿ.',
    },
    rule: 'Complete at least 1 diagnostic assessment.',
  },
  {
    id: 'badge-offline-ready',
    title: {en: 'Offline Ready Learner', kn: 'ಆಫ್‌ಲೈನ್ ಸಿದ್ಧ ಕಲಿಕಾರ್ಥಿ'},
    description: {
      en: 'Downloaded at least one lesson to IndexedDB for offline study.',
      kn: 'ಆಫ್‌ಲೈನ್ ಅಧ್ಯಯನಕ್ಕಾಗಿ ಕನಿಷ್ಠ ಒಂದು ಪಾಠವನ್ನು ಉಳಿಸಿದ್ದೀರಿ.',
    },
    rule: 'Download 1+ lesson for offline study.',
  },
  {
    id: 'badge-continuity-hero',
    title: {en: 'Continuity Champion', kn: 'ನಿರಂತರತೆ ವಿಜೇತ'},
    description: {
      en: 'Completed a quiz while offline and synced progress upon reconnection.',
      kn: 'ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಪರೀಕ್ಷೆ ಪೂರ್ಣಗೊಳಿಸಿ ಸಂಪರ್ಕ ಬಂದಾಗ ಸಿಂಕ್ ಮಾಡಿದ್ದೀರಿ.',
    },
    rule: 'Save a quiz offline and sync it to the classroom server.',
  },
  {
    id: 'badge-topic-master',
    title: {en: 'Topic Mastery Star', kn: 'ವಿಷಯ ಪ್ರಾವೀಣ್ಯತೆ ತಾರೆ'},
    description: {
      en: 'Reached 85%+ mastery in any curriculum topic.',
      kn: 'ಯಾವುದೇ ವಿಷಯದಲ್ಲಿ 85%+ ಪ್ರಾವೀಣ್ಯತೆ ಸಾಧಿಸಿದ್ದೀರಿ.',
    },
    rule: 'Achieve >= 85% mastery score on a topic.',
  },
];

export const SAMPLE_LESSONS: Lesson[] = [
  // MATHEMATICS
  {
    id: 'lesson-math-fractions',
    subject: 'mathematics',
    grade: 7,
    topicId: 'math-fractions',
    topicName: {en: 'Fractions & Ratios', kn: 'ಭಿನ್ನರಾಶಿಗಳು ಮತ್ತು ಅನುಪಾತ'},
    title: {
      en: 'Understanding Fractions & Unlike Denominators',
      kn: 'ಭಿನ್ನರಾಶಿಗಳು ಮತ್ತು ವಿಭಿನ್ನ ಛೇದಗಳ ಅರಿವು',
    },
    summary: {
      en: 'Step-by-step visual guide to comparing, simplifying, and adding fractions with everyday village examples.',
      kn: 'ದೈನಂದಿನ ಉದಾಹರಣೆಗಳೊಂದಿಗೆ ಭಿನ್ನರಾಶಿಗಳನ್ನು ಹೋಲಿಸುವ ಮತ್ತು ಕೂಡಿಸುವ ಸರಳ ಮಾರ್ಗದರ್ಶಿ.',
    },
    estimatedMinutes: 8,
    difficulty: 'beginner',
    isSampleContent: true,
    sections: [
      {
        heading: {
          en: '1. What Numerator and Denominator Mean',
          kn: '1. ಅಂಶ (Numerator) ಮತ್ತು ಛೇದ (Denominator) ಎಂದರೇನು?',
        },
        body: {
          en: 'A fraction has two parts: the bottom number (denominator) tells you how many equal parts make one whole, and the top number (numerator) tells you how many parts you have.',
          kn: 'ಭಿನ್ನರಾಶಿಯಲ್ಲಿ ಎರಡು ಭಾಗಗಳಿರುತ್ತವೆ: ಕೆಳಗಿನ ಸಂಖ್ಯೆ (ಛೇದ) ಒಂದು ಪೂರ್ಣ ವಸ್ತುವನ್ನು ಎಷ್ಟು ಸಮಭಾಗಗಳಾಗಿ ಮಾಡಲಾಗಿದೆ ಎಂಬುದನ್ನು ತೋರಿಸುತ್ತದೆ, ಮತ್ತು ಮೇಲಿನ ಸಂಖ್ಯೆ (ಅಂಶ) ಎಷ್ಟು ಭಾಗಗಳಿವೆ ಎಂಬುದನ್ನು ತೋರಿಸುತ್ತದೆ.',
        },
        example: {
          en: 'Example: If a rectangular farm plot is divided into 4 equal strips and 3 strips are planted with ragi, 3/4 of the plot has ragi.',
          kn: 'ಉದಾಹರಣೆ: ಒಂದು ಜಮೀನನ್ನು 4 ಸಮಭಾಗಗಳಾಗಿ ಮಾಡಿ 3 ಭಾಗಗಳಲ್ಲಿ ರಾಗಿ ಬೆಳೆದರೆ, 3/4 ಭಾಗದಲ್ಲಿ ರಾಗಿ ಇದೆ.',
        },
      },
      {
        heading: {
          en: '2. Adding Fractions with Different Denominators',
          kn: '2. ಬೇರೆ ಬೇರೆ ಛೇದಗಳಿರುವ ಭಿನ್ನರಾಶಿಗಳನ್ನು ಕೂಡಿಸುವುದು',
        },
        body: {
          en: 'Never add denominators directly! First find a common denominator (LCM) so both fractions represent equal-sized slices. Convert each fraction, then add only the numerators.',
          kn: 'ಛೇದಗಳನ್ನು ನೇರವಾಗಿ ಕೂಡಿಸಬೇಡಿ! ಮೊದಲು ಸಾಮಾನ್ಯ ಛೇದವನ್ನು (ಲ.ಸಾ.ಅ) ಕಂಡುಹಿಡಿದು ಸಮಾನ ಭಾಗಗಳಾಗಿ ಪರಿವರ್ತಿಸಿ, ನಂತರ ಅಂಶಗಳನ್ನು ಮಾತ್ರ ಕೂಡಿಸಿ.',
        },
        example: {
          en: 'Example: 1/2 + 1/4 = 2/4 + 1/4 = 3/4 (not 2/6!).',
          kn: 'ಉದಾಹರಣೆ: 1/2 + 1/4 = 2/4 + 1/4 = 3/4.',
        },
      },
    ],
    keyTakeaways: [
      {
        en: 'Always make denominators equal before adding or subtracting fractions.',
        kn: 'ಕೂಡಿಸುವ ಅಥವಾ ಕಳೆಯುವ ಮೊದಲು ಛೇದಗಳನ್ನು ಸಮಾನಗೊಳಿಸಿ.',
      },
      {
        en: 'Multiplying top and bottom by the same number gives an equivalent fraction.',
        kn: 'ಅಂಶ ಮತ್ತು ಛೇದವನ್ನು ಒಂದೇ ಸಂಖ್ಯೆಯಿಂದ ಗುಣಿಸಿದಾಗ ಸಮಾನ ಭಿನ್ನರಾಶಿ ಸಿಗುತ್ತದೆ.',
      },
    ],
  },
  {
    id: 'lesson-math-equations',
    subject: 'mathematics',
    grade: 7,
    topicId: 'math-equations',
    topicName: {en: 'Linear Equations', kn: 'ರೇಖೀಯ ಸಮೀಕರಣಗಳು'},
    title: {
      en: 'Balancing One-Variable Linear Equations',
      kn: 'ಒಂದು ಚರಾಕ್ಷರದ ರೇಖೀಯ ಸಮೀಕರಣಗಳನ್ನು ಬಿಡಿಸುವುದು',
    },
    summary: {
      en: 'Think of an equation like a market weighing scale—whatever you do to one side, do to the other.',
      kn: 'ಸಮೀಕರಣವನ್ನು ತಕ್ಕಡಿಯಂತೆ ಭಾವಿಸಿ—ಒಂದು ಬದಿಗೆ ಮಾಡಿದ್ದನ್ನು ಇನ್ನೊಂದು ಬದಿಗೂ ಮಾಡಿ.',
    },
    estimatedMinutes: 9,
    difficulty: 'intermediate',
    isSampleContent: true,
    sections: [
      {
        heading: {
          en: '1. The Balance Principle',
          kn: '1. ಸಮತೋಲನ ನಿಯಮ',
        },
        body: {
          en: 'In 2x + 5 = 13, x is an unknown number. To isolate x, reverse operations in order: subtract 5 from both sides to get 2x = 8, then divide both sides by 2 to get x = 4.',
          kn: '2x + 5 = 13 ರಲ್ಲಿ x ಎಂಬುದು ಅಜ್ಞಾತ ಸಂಖ್ಯೆ. ಎರಡೂ ಬದಿಗಳಿಂದ 5 ಕಳೆದರೆ 2x = 8 ಸಿಗುತ್ತದೆ. ನಂತರ 2 ರಿಂದ ಭಾಗಿಸಿದರೆ x = 4 ಸಿಗುತ್ತದೆ.',
        },
        example: {
          en: 'Check your answer by substituting x = 4 back: 2(4) + 5 = 8 + 5 = 13.',
          kn: 'ಉತ್ತರವನ್ನು ಪರೀಕ್ಷಿಸಿ: 2(4) + 5 = 8 + 5 = 13.',
        },
      },
    ],
    keyTakeaways: [
      {
        en: 'Undo addition/subtraction before multiplication/division when isolating x.',
        kn: 'ಮೊದಲು ಸಂಕಲನ/ವ್ಯವಕಲನವನ್ನು ತೆಗೆದು, ನಂತರ ಗುಣಾಕಾರ/ಭಾಗಾಕಾರ ಮಾಡಿ.',
      },
    ],
  },
  {
    id: 'lesson-math-geometry',
    subject: 'mathematics',
    grade: 8,
    topicId: 'math-geometry',
    topicName: {en: 'Angles & Triangles', kn: 'ಕೋನಗಳು ಮತ್ತು ತ್ರಿಭುಜಗಳು'},
    title: {
      en: 'Triangle Angle Sum & Perimeter Foundations',
      kn: 'ತ್ರಿಭುಜದ ಕೋನಗಳ ಮೊತ್ತ ಮತ್ತು ಸುತ್ತಳತೆ',
    },
    summary: {
      en: 'Master interior angles of triangles and practical perimeter calculations.',
      kn: 'ತ್ರಿಭುಜದ ಒಳಕೋನಗಳು ಮತ್ತು ಸುತ್ತಳತೆ ಲೆಕ್ಕಾಚಾರವನ್ನು ಕಲಿಯಿರಿ.',
    },
    estimatedMinutes: 7,
    difficulty: 'intermediate',
    isSampleContent: true,
    sections: [
      {
        heading: {
          en: '1. The 180° Triangle Rule',
          kn: '1. ತ್ರಿಭುಜದ 180° ನಿಯಮ',
        },
        body: {
          en: 'The three interior angles of any flat triangle always add up to 180 degrees. If you know two angles, subtract their sum from 180° to find the third.',
          kn: 'ಯಾವುದೇ ತ್ರಿಭುಜದ ಮೂರು ಒಳಕೋನಗಳ ಮೊತ್ತ ಯಾವಾಗಲೂ 180 ಡಿಗ್ರಿ ಆಗಿರುತ್ತದೆ.',
        },
        example: {
          en: 'If two angles are 65° and 45°, the third angle is 180° - (65° + 45°) = 70°.',
          kn: 'ಎರಡು ಕೋನಗಳು 65° ಮತ್ತು 45° ಇದ್ದರೆ, ಮೂರನೇ ಕೋನ = 180° - 110° = 70°.',
        },
      },
    ],
    keyTakeaways: [
      {
        en: 'Sum of angles in any triangle = 180°.',
        kn: 'ತ್ರಿಭುಜದ ಒಳಕೋನಗಳ ಮೊತ್ತ = 180°.',
      },
    ],
  },

  // SCIENCE
  {
    id: 'lesson-sci-plants',
    subject: 'science',
    grade: 7,
    topicId: 'sci-plants',
    topicName: {en: 'Plant Nutrition & Transport', kn: 'ಸಸ್ಯ ಪೋಷಣೆ ಮತ್ತು ಸಾಗಣೆ'},
    title: {
      en: 'Photosynthesis, Xylem & Phloem Explained',
      kn: 'ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ, ಕ್ಸೈಲಂ ಮತ್ತು ಫ್ಲೋಯಂ',
    },
    summary: {
      en: 'Understand how leaves make food using sunlight and how plant tubes transport water and sugar.',
      kn: 'ಎಲೆಗಳು ಸೂರ್ಯನ ಬೆಳಕಿನಲ್ಲಿ ಆಹಾರ ತಯಾರಿಸುವ ಮತ್ತು ಸಸ್ಯಗಳಲ್ಲಿ ನೀರು ಸಾಗಣೆಯ ವಿಧಾನ.',
    },
    estimatedMinutes: 8,
    difficulty: 'beginner',
    isSampleContent: true,
    sections: [
      {
        heading: {
          en: '1. How Leaves Make Food (Photosynthesis)',
          kn: '1. ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ (Photosynthesis)',
        },
        body: {
          en: 'Green leaves contain chlorophyll, which traps sunlight. Using water from roots and carbon dioxide from air, leaves make glucose (food) and release oxygen.',
          kn: 'ಹಸಿರು ಎಲೆಗಳಲ್ಲಿರುವ ಕ್ಲೋರೊಫಿಲ್ ಸೂರ್ಯನ ಬೆಳಕನ್ನು ಹೀರಿಕೊಂಡು ನೀರು ಮತ್ತು ಕಾರ್ಬನ್ ಡೈಆಕ್ಸೈಡ್ ಸಹಾಯದಿಂದ ಆಹಾರ (ಗ್ಲೂಕೋಸ್) ತಯಾರಿಸಿ ಆಮ್ಲಜನಕವನ್ನು ಬಿಡುಗಡೆ ಮಾಡುತ್ತದೆ.',
        },
        example: {
          en: 'Think of Xylem as upward water pipes from roots to leaves, and Phloem as food delivery tubes carrying sugar everywhere.',
          kn: 'ಕ್ಸೈಲಂ ಬೇರುಗಳಿಂದ ಎಲೆಗಳಿಗೆ ನೀರು ಒಯ್ಯುವ ಕೊಳವೆ, ಫ್ಲೋಯಂ ಆಹಾರ ಸಾಗಿಸುವ ಕೊಳವೆ.',
        },
      },
    ],
    keyTakeaways: [
      {
        en: 'Xylem carries water upward; Phloem distributes prepared food.',
        kn: 'ಕ್ಸೈಲಂ ನೀರನ್ನು ಸಾಗಿಸುತ್ತದೆ; ಫ್ಲೋಯಂ ಆಹಾರವನ್ನು ಸಾಗಿಸುತ್ತದೆ.',
      },
    ],
  },
  {
    id: 'lesson-sci-circuits',
    subject: 'science',
    grade: 7,
    topicId: 'sci-circuits',
    topicName: {en: 'Electricity & Circuits', kn: 'ವಿದ್ಯುತ್ ಮತ್ತು ಮಂಡಲಗಳು'},
    title: {
      en: 'Closed Circuits, Conductors & Solar Microgrids',
      kn: 'ಸಂಪೂರ್ಣ ವಿದ್ಯುತ್ ಮಂಡಲ, ವಾಹಕಗಳು ಮತ್ತು ಸೌರಶಕ್ತಿ',
    },
    summary: {
      en: 'Learn why current needs a complete loop and how series vs parallel connections work in rural solar lamps.',
      kn: 'ವಿದ್ಯುತ್ ಪ್ರವಾಹಕ್ಕೆ ಪೂರ್ಣ ಮಂಡಲ ಏಕೆ ಬೇಕು ಮತ್ತು ಸರಣಿ vs ಸಮಾನಾಂತರ ಸಂಪರ್ಕ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ.',
    },
    estimatedMinutes: 9,
    difficulty: 'intermediate',
    isSampleContent: true,
    sections: [
      {
        heading: {
          en: '1. Open vs Closed Circuit',
          kn: '1. ತೆರೆದ ಮತ್ತು ಮುಚ್ಚಿದ ವಿದ್ಯುತ್ ಮಂಡಲ',
        },
        body: {
          en: 'Electric current flows only through a continuous closed path from battery positive terminal through the bulb and back to the negative terminal. A switch simply opens or closes that path.',
          kn: 'ಬ್ಯಾಟರಿಯ ಧನ ಧ್ರುವದಿಂದ ಬಲ್ಬ್ ಮೂಲಕ ಋಣ ಧ್ರುವಕ್ಕೆ ನಿರಂತರ ಮಾರ್ಗವಿದ್ದಾಗ ಮಾತ್ರ ವಿದ್ಯುತ್ ಹರಿಯುತ್ತದೆ.',
        },
        example: {
          en: 'In parallel wiring, if one classroom LED fails, the other LEDs stay lit.',
          kn: 'ಸಮಾನಾಂತರ ಸಂಪರ್ಕದಲ್ಲಿ ಒಂದು ಬಲ್ಬ್ ಕೆಟ್ಟರೂ ಉಳಿದ ಬಲ್ಬ್‌ಗಳು ಉರಿಯುತ್ತವೆ.',
        },
      },
    ],
    keyTakeaways: [
      {
        en: 'Metals like copper are conductors; rubber and dry wood are insulators.',
        kn: 'ತಾಮ್ರ ಉತ್ತಮ ವಾಹಕ; ರಬ್ಬರ್ ಮತ್ತು ಒಣ ಮರ ಅವಾಹಕಗಳು.',
      },
    ],
  },
  {
    id: 'lesson-sci-matter',
    subject: 'science',
    grade: 8,
    topicId: 'sci-matter',
    topicName: {en: 'States of Matter & Atoms', kn: 'ದ್ರವ್ಯದ ಸ್ಥಿತಿಗಳು ಮತ್ತು ಪರಮಾಣುಗಳು'},
    title: {
      en: 'Particle Arrangement in Solids, Liquids, and Gases',
      kn: 'ಘನ, ದ್ರವ ಮತ್ತು ಅನಿಲಗಳಲ್ಲಿ ಕಣಗಳ ಜೋಡಣೆ',
    },
    summary: {
      en: 'How particle spacing and energy explain melting, boiling, and evaporation.',
      kn: 'ಕಣಗಳ ನಡುವಿನ ಅಂತರ ಮತ್ತು ಶಕ್ತಿಯಿಂದ ಕರಗುವಿಕೆ ಮತ್ತು ಕುದಿಯುವಿಕೆ ಹೇಗೆ ನಡೆಯುತ್ತದೆ.',
    },
    estimatedMinutes: 7,
    difficulty: 'intermediate',
    isSampleContent: true,
    sections: [
      {
        heading: {
          en: '1. Heating Changes Particle Motion',
          kn: '1. ಉಷ್ಣದಿಂದ ಕಣಗಳ ಚಲನೆ ಬದಲಾಗುತ್ತದೆ',
        },
        body: {
          en: 'Solids have tightly packed vibrating particles. Adding heat increases particle energy so they slide past each other (liquid) or spread freely (gas).',
          kn: 'ಘನವಸ್ತುಗಳಲ್ಲಿ ಕಣಗಳು ಹತ್ತಿರದಲ್ಲಿರುತ್ತವೆ. ಶಾಖ ನೀಡಿದಾಗ ಅವುಗಳ ಚಲನೆ ಹೆಚ್ಚಾಗಿ ದ್ರವ ಮತ್ತು ಅನಿಲವಾಗುತ್ತವೆ.',
        },
      },
    ],
    keyTakeaways: [
      {
        en: 'Temperature rises speed up particles without destroying matter.',
        kn: 'ತಾಪಮಾನ ಹೆಚ್ಚಾದಾಗ ಕಣಗಳ ವೇಗ ಹೆಚ್ಚುತ್ತದೆ.',
      },
    ],
  },

  // ENGLISH
  {
    id: 'lesson-eng-tenses',
    subject: 'english',
    grade: 7,
    topicId: 'eng-tenses',
    topicName: {en: 'Verb Tenses & Agreement', kn: 'ಕ್ರಿಯಾಪದ ಕಾಲಗಳು ಮತ್ತು ಹೊಂದಾಣಿಕೆ'},
    title: {
      en: 'Mastering Present, Past & Subject-Verb Agreement',
      kn: 'ವರ್ತಮಾನ, ಭೂತಕಾಲ ಮತ್ತು ಕರ್ತೃ-ಕ್ರಿಯಾಪದ ಹೊಂದಾಣಿಕೆ',
    },
    summary: {
      en: 'Clear rules to match singular and plural subjects with the right verb tense.',
      kn: 'ಏಕವಚನ ಮತ್ತು ಬಹುವಚನ ಕರ್ತೃಗಳಿಗೆ ಸರಿಯಾದ ಕ್ರಿಯಾಪದ ಬಳಸುವ ನಿಯಮಗಳು.',
    },
    estimatedMinutes: 7,
    difficulty: 'beginner',
    isSampleContent: true,
    sections: [
      {
        heading: {
          en: '1. Singular Subject Takes -s in Simple Present',
          kn: '1. ಏಕವಚನ ಕರ್ತೃವಿಗೆ ಸರಳ ವರ್ತಮಾನದಲ್ಲಿ -s ಸೇರುತ್ತದೆ',
        },
        body: {
          en: 'Use "reads" for he/she/it ("Meera reads every evening"), and "read" for I/you/we/they ("Students read together").',
          kn: 'He/She/It ಬಂದಾಗ "reads" ಮತ್ತು I/We/They ಬಂದಾಗ "read" ಬಳಸಬೇಕು.',
        },
        example: {
          en: 'Correct: "The school bell rings at 9 AM." Incorrect: "The school bell ring at 9 AM."',
          kn: 'ಸರಿ: "The school bell rings at 9 AM."',
        },
      },
    ],
    keyTakeaways: [
      {
        en: 'Check whether your subject is singular or plural before choosing the verb.',
        kn: 'ಕ್ರಿಯಾಪದ ಆಯ್ಕೆ ಮಾಡುವ ಮೊದಲು ಕರ್ತೃ ಏಕವಚನವೋ ಬಹುವಚನವೋ ನೋಡಿ.',
      },
    ],
  },
  {
    id: 'lesson-eng-comprehension',
    subject: 'english',
    grade: 7,
    topicId: 'eng-comprehension',
    topicName: {en: 'Reading Comprehension', kn: 'ಓದುವ ಗ್ರಹಿಕೆ'},
    title: {
      en: 'Finding Main Ideas & Evidence in Short Passages',
      kn: 'ಪ್ಯಾರಾಗ್ರಾಫ್‌ನಲ್ಲಿ ಮುಖ್ಯ ವಿಚಾರ ಮತ್ತು ಪುರಾವೆ ಹುಡುಕುವುದು',
    },
    summary: {
      en: 'Practical strategies to identify the central point, context clues, and inference.',
      kn: 'ಮುಖ್ಯ ಸಂದೇಶ ಮತ್ತು ಸಂದರ್ಭದ ಅರ್ಥವನ್ನು ಸುಲಭವಾಗಿ ಕಂಡುಹಿಡಿಯುವ ತಂತ್ರಗಳು.',
    },
    estimatedMinutes: 8,
    difficulty: 'intermediate',
    isSampleContent: true,
    sections: [
      {
        heading: {
          en: '1. Topic Sentence + Supporting Evidence',
          kn: '1. ಮುಖ್ಯ ವಾಕ್ಯ ಮತ್ತು ಪೂರಕ ವಿವರಗಳು',
        },
        body: {
          en: 'Read the first and last sentences carefully to spot the main idea. Always verify your answer using exact evidence from the passage rather than guessing.',
          kn: 'ಮೊದಲ ಮತ್ತು ಕೊನೆಯ ವಾಕ್ಯಗಳನ್ನು ಗಮನಿಸಿ ಮುಖ್ಯ ವಿಚಾರ ತಿಳಿಯಿರಿ. ಪಠ್ಯದಲ್ಲೇ ಉತ್ತರದ ಆಧಾರ ಹುಡುಕಿ.',
        },
      },
    ],
    keyTakeaways: [
      {
        en: 'Main idea summarizes the whole paragraph; details support it.',
        kn: 'ಮುಖ್ಯ ವಿಚಾರ ಇಡೀ ಪ್ಯಾರಾದ ಸಾರಾಂಶವಾಗಿರುತ್ತದೆ.',
      },
    ],
  },
  {
    id: 'lesson-eng-structure',
    subject: 'english',
    grade: 8,
    topicId: 'eng-structure',
    topicName: {en: 'Sentence Connectors', kn: 'ವಾಕ್ಯ ಸಂಯೋಜಕಗಳು'},
    title: {
      en: 'Using Conjunctions for Clear Cause & Contrast',
      kn: 'ಕಾರಣ ಮತ್ತು ವಿರೋಧಾಭಾಸ ತೋರಿಸಲು ಸಂಯೋಜಕಗಳ ಬಳಕೆ',
    },
    summary: {
      en: 'Connect ideas cleanly using because, although, therefore, and however.',
      kn: 'because, although, therefore ಪದಗಳನ್ನು ಸರಿಯಾಗಿ ಬಳಸುವ ವಿಧಾನ.',
    },
    estimatedMinutes: 6,
    difficulty: 'intermediate',
    isSampleContent: true,
    sections: [
      {
        heading: {
          en: '1. Cause vs Contrast Connectors',
          kn: '1. ಕಾರಣ ಮತ್ತು ವಿರೋಧ ಸೂಚಿಸುವ ಪದಗಳು',
        },
        body: {
          en: 'Use "because" to give a reason ("She studied offline because the tower was down"). Use "although" to show contrast ("Although the rain was heavy, students finished the quiz").',
          kn: 'ಕಾರಣ ತಿಳಿಸಲು "because" ಮತ್ತು ವಿಭಿನ್ನ/ವಿರುದ್ಧ ಪರಿಸ್ಥಿತಿ ತಿಳಿಸಲು "although" ಬಳಸಿ.',
        },
      },
    ],
    keyTakeaways: [
      {
        en: 'Match the connector meaning (reason, result, or contrast) to the two ideas.',
        kn: 'ಎರಡು ವಾಕ್ಯಗಳ ಸಂಬಂಧಕ್ಕೆ ತಕ್ಕ ಸಂಯೋಜಕವನ್ನು ಆರಿಸಿ.',
      },
    ],
  },
];

export const SAMPLE_QUESTIONS: Question[] = [
  // MATHEMATICS — Fractions (3 difficulties + extra diagnostic/practice)
  {
    id: 'q-math-frac-1',
    subject: 'mathematics',
    grade: 7,
    topicId: 'math-fractions',
    topicName: {en: 'Fractions & Ratios', kn: 'ಭಿನ್ನರಾಶಿಗಳು ಮತ್ತು ಅನುಪಾತ'},
    difficulty: 'beginner',
    prompt: {
      en: 'What is 1/2 + 1/4?',
      kn: '1/2 + 1/4 ಎಷ್ಟು?',
    },
    options: [
      {en: '2/6', kn: '2/6'},
      {en: '3/4', kn: '3/4'},
      {en: '2/4', kn: '2/4'},
      {en: '1/6', kn: '1/6'},
    ],
    correctIndex: 1,
    explanation: {
      en: 'Convert 1/2 to 2/4 so both fractions have denominator 4. Then 2/4 + 1/4 = 3/4.',
      kn: '1/2 ಅನ್ನು 2/4 ಎಂದು ಬದಲಿಸಿ. ಆಗ 2/4 + 1/4 = 3/4 ಆಗುತ್ತದೆ.',
    },
    isSampleContent: true,
  },
  {
    id: 'q-math-frac-2',
    subject: 'mathematics',
    grade: 7,
    topicId: 'math-fractions',
    topicName: {en: 'Fractions & Ratios', kn: 'ಭಿನ್ನರಾಶಿಗಳು ಮತ್ತು ಅನುಪಾತ'},
    difficulty: 'beginner',
    prompt: {
      en: 'A water tank is 3/5 full. What fraction of the tank is still empty?',
      kn: 'ಒಂದು ನೀರಿನ ಟ್ಯಾಂಕ್ 3/5 ರಷ್ಟು ತುಂಬಿದೆ. ಇನ್ನೂ ಎಷ್ಟು ಭಾಗ ಖಾಲಿ ಇದೆ?',
    },
    options: [
      {en: '2/5', kn: '2/5'},
      {en: '3/5', kn: '3/5'},
      {en: '1/5', kn: '1/5'},
      {en: '2/3', kn: '2/3'},
    ],
    correctIndex: 0,
    explanation: {
      en: 'One full tank equals 5/5. Subtracting 3/5 leaves 5/5 - 3/5 = 2/5 empty.',
      kn: 'ಪೂರ್ಣ ಟ್ಯಾಂಕ್ ಎಂದರೆ 5/5. 5/5 - 3/5 = 2/5 ಭಾಗ ಖಾಲಿ ಇದೆ.',
    },
    isSampleContent: true,
  },
  {
    id: 'q-math-frac-3',
    subject: 'mathematics',
    grade: 7,
    topicId: 'math-fractions',
    topicName: {en: 'Fractions & Ratios', kn: 'ಭಿನ್ನರಾಶಿಗಳು ಮತ್ತು ಅನುಪಾತ'},
    difficulty: 'intermediate',
    prompt: {
      en: 'Which fraction is largest: 2/3, 3/5, or 5/8?',
      kn: 'ಇವುಗಳಲ್ಲಿ ಅತಿ ದೊಡ್ಡ ಭಿನ್ನರಾಶಿ ಯಾವುದು: 2/3, 3/5, ಅಥವಾ 5/8?',
    },
    options: [
      {en: '3/5', kn: '3/5'},
      {en: '5/8', kn: '5/8'},
      {en: '2/3', kn: '2/3'},
      {en: 'All are equal', kn: 'ಎಲ್ಲವೂ ಸಮಾನ'},
    ],
    correctIndex: 2,
    explanation: {
      en: 'Using common denominator 120: 2/3 = 80/120, 3/5 = 72/120, 5/8 = 75/120. Thus 2/3 is largest.',
      kn: 'ಸಾಮಾನ್ಯ ಛೇದ 120 ತೆಗೆದುಕೊಂಡರೆ: 2/3 = 80/120, 3/5 = 72/120, 5/8 = 75/120. ಆದ್ದರಿಂದ 2/3 ದೊಡ್ಡದು.',
    },
    isSampleContent: true,
  },
  {
    id: 'q-math-frac-4',
    subject: 'mathematics',
    grade: 7,
    topicId: 'math-fractions',
    topicName: {en: 'Fractions & Ratios', kn: 'ಭಿನ್ನರಾಶಿಗಳು ಮತ್ತು ಅನುಪಾತ'},
    difficulty: 'advanced',
    prompt: {
      en: 'A farmer harvests 2/3 of a field on Monday and 1/6 on Tuesday. What fraction remains?',
      kn: 'ಒಬ್ಬ ರೈತ ಸೋಮವಾರ 2/3 ಭಾಗ ಮತ್ತು ಮಂಗಳವಾರ 1/6 ಭಾಗ ಕೊಯ್ಲು ಮಾಡಿದನು. ಉಳಿದ ಭಾಗ ಎಷ್ಟು?',
    },
    options: [
      {en: '1/6', kn: '1/6'},
      {en: '1/3', kn: '1/3'},
      {en: '1/2', kn: '1/2'},
      {en: '5/6', kn: '5/6'},
    ],
    correctIndex: 0,
    explanation: {
      en: '2/3 + 1/6 = 4/6 + 1/6 = 5/6 harvested. Remaining = 1 - 5/6 = 1/6.',
      kn: '2/3 + 1/6 = 5/6 ಕೊಯ್ಲಾಗಿದೆ. ಉಳಿದ ಭಾಗ = 1 - 5/6 = 1/6.',
    },
    isSampleContent: true,
  },

  // MATHEMATICS — Linear Equations
  {
    id: 'q-math-eq-1',
    subject: 'mathematics',
    grade: 7,
    topicId: 'math-equations',
    topicName: {en: 'Linear Equations', kn: 'ರೇಖೀಯ ಸಮೀಕರಣಗಳು'},
    difficulty: 'beginner',
    prompt: {
      en: 'Solve for x: x + 9 = 15',
      kn: 'x ಬೆಲೆ ಕಂಡುಹಿಡಿಯಿರಿ: x + 9 = 15',
    },
    options: [
      {en: '4', kn: '4'},
      {en: '6', kn: '6'},
      {en: '24', kn: '24'},
      {en: '5', kn: '5'},
    ],
    correctIndex: 1,
    explanation: {
      en: 'Subtract 9 from both sides: x = 15 - 9 = 6.',
      kn: 'ಎರಡೂ ಬದಿಗಳಿಂದ 9 ಕಳೆಯಿರಿ: x = 15 - 9 = 6.',
    },
    isSampleContent: true,
  },
  {
    id: 'q-math-eq-2',
    subject: 'mathematics',
    grade: 7,
    topicId: 'math-equations',
    topicName: {en: 'Linear Equations', kn: 'ರೇಖೀಯ ಸಮೀಕರಣಗಳು'},
    difficulty: 'intermediate',
    prompt: {
      en: 'Solve for y: 3y - 4 = 11',
      kn: 'y ಬೆಲೆ ಕಂಡುಹಿಡಿಯಿರಿ: 3y - 4 = 11',
    },
    options: [
      {en: '3', kn: '3'},
      {en: '5', kn: '5'},
      {en: '7', kn: '7'},
      {en: '15', kn: '15'},
    ],
    correctIndex: 1,
    explanation: {
      en: 'Add 4 to both sides: 3y = 15. Divide by 3: y = 5.',
      kn: 'ಎರಡೂ ಬದಿಗಳಿಗೆ 4 ಕೂಡಿಸಿ: 3y = 15. 3 ರಿಂದ ಭಾಗಿಸಿದರೆ y = 5.',
    },
    isSampleContent: true,
  },
  {
    id: 'q-math-eq-3',
    subject: 'mathematics',
    grade: 8,
    topicId: 'math-equations',
    topicName: {en: 'Linear Equations', kn: 'ರೇಖೀಯ ಸಮೀಕರಣಗಳು'},
    difficulty: 'advanced',
    prompt: {
      en: 'Two notebooks and a ₹10 pen cost ₹54 total. What is the cost of one notebook?',
      kn: 'ಎರಡು ನೋಟ್‌ಬುಕ್ ಮತ್ತು ₹10 ಪೆನ್ನಿನ ಒಟ್ಟು ಬೆಲೆ ₹54. ಒಂದು ನೋಟ್‌ಬುಕ್ ಬೆಲೆ ಎಷ್ಟು?',
    },
    options: [
      {en: '₹20', kn: '₹20'},
      {en: '₹22', kn: '₹22'},
      {en: '₹27', kn: '₹27'},
      {en: '₹32', kn: '₹32'},
    ],
    correctIndex: 1,
    explanation: {
      en: 'Equation: 2n + 10 = 54 → 2n = 44 → n = ₹22.',
      kn: 'ಸಮೀಕರಣ: 2n + 10 = 54 → 2n = 44 → n = ₹22.',
    },
    isSampleContent: true,
  },

  // MATHEMATICS — Geometry
  {
    id: 'q-math-geo-1',
    subject: 'mathematics',
    grade: 7,
    topicId: 'math-geometry',
    topicName: {en: 'Angles & Triangles', kn: 'ಕೋನಗಳು ಮತ್ತು ತ್ರಿಭುಜಗಳು'},
    difficulty: 'beginner',
    prompt: {
      en: 'A triangle has angles 50° and 60°. What is the third angle?',
      kn: 'ಒಂದು ತ್ರಿಭುಜದ ಎರಡು ಕೋನಗಳು 50° ಮತ್ತು 60° ಇವೆ. ಮೂರನೇ ಕೋನ ಎಷ್ಟು?',
    },
    options: [
      {en: '60°', kn: '60°'},
      {en: '70°', kn: '70°'},
      {en: '80°', kn: '80°'},
      {en: '90°', kn: '90°'},
    ],
    correctIndex: 1,
    explanation: {
      en: 'Angles in a triangle total 180°. 180° - (50° + 60°) = 70°.',
      kn: 'ತ್ರಿಭುಜದ ಕೋನಗಳ ಮೊತ್ತ 180°. 180° - 110° = 70°.',
    },
    isSampleContent: true,
  },
  {
    id: 'q-math-geo-2',
    subject: 'mathematics',
    grade: 8,
    topicId: 'math-geometry',
    topicName: {en: 'Angles & Triangles', kn: 'ಕೋನಗಳು ಮತ್ತು ತ್ರಿಭುಜಗಳು'},
    difficulty: 'intermediate',
    prompt: {
      en: 'What is the perimeter of a rectangular garden 12 m long and 8 m wide?',
      kn: '12 ಮೀ ಉದ್ದ ಮತ್ತು 8 ಮೀ ಅಗಲವಿರುವ ಆಯತಾಕಾರದ ತೋಟದ ಸುತ್ತಳತೆ ಎಷ್ಟು?',
    },
    options: [
      {en: '20 m', kn: '20 ಮೀ'},
      {en: '40 m', kn: '40 ಮೀ'},
      {en: '96 m', kn: '96 ಮೀ'},
      {en: '32 m', kn: '32 ಮೀ'},
    ],
    correctIndex: 1,
    explanation: {
      en: 'Perimeter = 2 × (length + width) = 2 × (12 + 8) = 40 m.',
      kn: 'ಸುತ್ತಳತೆ = 2 × (12 + 8) = 40 ಮೀ.',
    },
    isSampleContent: true,
  },
  {
    id: 'q-math-geo-3',
    subject: 'mathematics',
    grade: 8,
    topicId: 'math-geometry',
    topicName: {en: 'Angles & Triangles', kn: 'ಕೋನಗಳು ಮತ್ತು ತ್ರಿಭುಜಗಳು'},
    difficulty: 'advanced',
    prompt: {
      en: 'An isosceles triangle has a vertex angle of 40°. What is each equal base angle?',
      kn: 'ಒಂದು ಸಮದ್ವಿಬಾಹು ತ್ರಿಭುಜದ ಶೃಂಗ ಕೋನ 40° ಆದರೆ, ಪ್ರತಿಯೊಂದು ಪಾದ ಕೋನ ಎಷ್ಟು?',
    },
    options: [
      {en: '40°', kn: '40°'},
      {en: '70°', kn: '70°'},
      {en: '140°', kn: '140°'},
      {en: '50°', kn: '50°'},
    ],
    correctIndex: 1,
    explanation: {
      en: 'Remaining sum = 180° - 40° = 140°. Divided equally between two base angles: 140° / 2 = 70°.',
      kn: 'ಉಳಿದ ಕೋನಗಳ ಮೊತ್ತ 180° - 40° = 140°. ಎರಡು ಸಮ ಪಾದ ಕೋನಗಳು = 70°.',
    },
    isSampleContent: true,
  },

  // SCIENCE — Plant Biology
  {
    id: 'q-sci-plant-1',
    subject: 'science',
    grade: 7,
    topicId: 'sci-plants',
    topicName: {en: 'Plant Nutrition & Transport', kn: 'ಸಸ್ಯ ಪೋಷಣೆ ಮತ್ತು ಸಾಗಣೆ'},
    difficulty: 'beginner',
    prompt: {
      en: 'Which tissue carries water from a plant’s roots up to its leaves?',
      kn: 'ಸಸ್ಯದ ಬೇರುಗಳಿಂದ ಎಲೆಗಳಿಗೆ ನೀರನ್ನು ಸಾಗಿಸುವ ಅಂಗಾಂಶ ಯಾವುದು?',
    },
    options: [
      {en: 'Phloem', kn: 'ಫ್ಲೋಯಂ'},
      {en: 'Xylem', kn: 'ಕ್ಸೈಲಂ'},
      {en: 'Stomata', kn: 'ಪತ್ರರಂಧ್ರ'},
      {en: 'Pollen', kn: 'ಪರಾಗ'},
    ],
    correctIndex: 1,
    explanation: {
      en: 'Xylem vessels transport water and dissolved minerals upward from the roots.',
      kn: 'ಕ್ಸೈಲಂ ನಾಳಗಳು ಬೇರುಗಳಿಂದ ನೀರು ಮತ್ತು ಖನಿಜಗಳನ್ನು ಮೇಲಕ್ಕೆ ಸಾಗಿಸುತ್ತವೆ.',
    },
    isSampleContent: true,
  },
  {
    id: 'q-sci-plant-2',
    subject: 'science',
    grade: 7,
    topicId: 'sci-plants',
    topicName: {en: 'Plant Nutrition & Transport', kn: 'ಸಸ್ಯ ಪೋಷಣೆ ಮತ್ತು ಸಾಗಣೆ'},
    difficulty: 'intermediate',
    prompt: {
      en: 'Which gas do leaves take in during photosynthesis?',
      kn: 'ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ ಸಮಯದಲ್ಲಿ ಎಲೆಗಳು ಯಾವ ಅನಿಲವನ್ನು ಒಳಗೆ ತೆಗೆದುಕೊಳ್ಳುತ್ತವೆ?',
    },
    options: [
      {en: 'Nitrogen', kn: 'ಸಾರಜನಕ'},
      {en: 'Carbon dioxide', kn: 'ಕಾರ್ಬನ್ ಡೈಆಕ್ಸೈಡ್'},
      {en: 'Argon', kn: 'ಆರ್ಗಾನ್'},
      {en: 'Hydrogen', kn: 'ಜಲಜನಕ'},
    ],
    correctIndex: 1,
    explanation: {
      en: 'Plants absorb carbon dioxide through stomata and combine it with water using sunlight.',
      kn: 'ಸಸ್ಯಗಳು ಪತ್ರರಂಧ್ರಗಳ ಮೂಲಕ ಕಾರ್ಬನ್ ಡೈಆಕ್ಸೈಡ್ ಹೀರಿಕೊಂಡು ಆಹಾರ ತಯಾರಿಸುತ್ತವೆ.',
    },
    isSampleContent: true,
  },
  {
    id: 'q-sci-plant-3',
    subject: 'science',
    grade: 8,
    topicId: 'sci-plants',
    topicName: {en: 'Plant Nutrition & Transport', kn: 'ಸಸ್ಯ ಪೋಷಣೆ ಮತ್ತು ಸಾಗಣೆ'},
    difficulty: 'advanced',
    prompt: {
      en: 'If a ring of bark (containing phloem) is removed around a stem, what stops moving downward?',
      kn: 'ಕಾಂಡದ ಸುತ್ತಲಿನ ತೊಗಟೆ (ಫ್ಲೋಯಂ) ತೆಗೆದರೆ ಕೆಳಗೆ ಯಾವುದರ ಸಾಗಣೆ ನಿಲ್ಲುತ್ತದೆ?',
    },
    options: [
      {en: 'Soil water', kn: 'ಮಣ್ಣಿನ ನೀರು'},
      {en: 'Prepared sugars (glucose)', kn: 'ತಯಾರಾದ ಸಕ್ಕರೆ (ಆಹಾರ)'},
      {en: 'Sunlight', kn: 'ಸೂರ್ಯನ ಬೆಳಕು'},
      {en: 'Oxygen gas', kn: 'ಆಮ್ಲಜನಕ ಅನಿಲ'},
    ],
    correctIndex: 1,
    explanation: {
      en: 'Phloem transports sugars made in leaves down to roots and stems.',
      kn: 'ಫ್ಲೋಯಂ ಎಲೆಗಳಲ್ಲಿ ತಯಾರಾದ ಆಹಾರವನ್ನು ಬೇರುಗಳಿಗೆ ಸಾಗಿಸುತ್ತದೆ.',
    },
    isSampleContent: true,
  },

  // SCIENCE — Circuits
  {
    id: 'q-sci-cir-1',
    subject: 'science',
    grade: 7,
    topicId: 'sci-circuits',
    topicName: {en: 'Electricity & Circuits', kn: 'ವಿದ್ಯುತ್ ಮತ್ತು ಮಂಡಲಗಳು'},
    difficulty: 'beginner',
    prompt: {
      en: 'Which material is a good conductor of electricity?',
      kn: 'ಇವುಗಳಲ್ಲಿ ಯಾವುದು ಉತ್ತಮ ವಿದ್ಯುತ್ ವಾಹಕ?',
    },
    options: [
      {en: 'Dry wood', kn: 'ಒಣ ಮರ'},
      {en: 'Plastic ruler', kn: 'ಪ್ಲಾಸ್ಟಿಕ್ ಸ್ಕೇಲ್'},
      {en: 'Copper wire', kn: 'ತಾಮ್ರದ ತಂತಿ'},
      {en: 'Rubber band', kn: 'ರಬ್ಬರ್ ಬ್ಯಾಂಡ್'},
    ],
    correctIndex: 2,
    explanation: {
      en: 'Copper is a metal with free electrons, allowing electric current to flow easily.',
      kn: 'ತಾಮ್ರ ಲೋಹವಾಗಿದ್ದು ವಿದ್ಯುತ್ ಸುಲಭವಾಗಿ ಹರಿಯಲು ಬಿಡುತ್ತದೆ.',
    },
    isSampleContent: true,
  },
  {
    id: 'q-sci-cir-2',
    subject: 'science',
    grade: 7,
    topicId: 'sci-circuits',
    topicName: {en: 'Electricity & Circuits', kn: 'ವಿದ್ಯುತ್ ಮತ್ತು ಮಂಡಲಗಳು'},
    difficulty: 'intermediate',
    prompt: {
      en: 'Why do classroom lights usually use parallel connections instead of series?',
      kn: 'ತರಗತಿಯ ದೀಪಗಳನ್ನು ಸರಣಿಗಿಂತ ಸಮಾನಾಂತರ ಸಂಪರ್ಕದಲ್ಲಿ ಏಕೆ ಜೋಡಿಸುತ್ತಾರೆ?',
    },
    options: [
      {
        en: 'So if one bulb stops working, the others stay lit',
        kn: 'ಒಂದು ಬಲ್ಬ್ ಕೆಟ್ಟರೂ ಉಳಿದವು ಉರಿಯುತ್ತಿರುತ್ತವೆ',
      },
      {en: 'To reduce wire length to zero', kn: 'ತಂತಿಯೇ ಬೇಡವಾಗುತ್ತದೆ'},
      {en: 'To block battery voltage', kn: 'ವೋಲ್ಟೇಜ್ ತಡೆಯಲು'},
      {en: 'So all bulbs dim together', kn: 'ಎಲ್ಲಾ ಬಲ್ಬ್‌ಗಳು ಮಂದವಾಗಲು'},
    ],
    correctIndex: 0,
    explanation: {
      en: 'In a parallel circuit, each branch has its own independent path to the power source.',
      kn: 'ಸಮಾನಾಂತರ ಮಂಡಲದಲ್ಲಿ ಪ್ರತಿಯೊಂದು ಬಲ್ಬ್‌ಗೂ ಸ್ವತಂತ್ರ ವಿದ್ಯುತ್ ಮಾರ್ಗವಿರುತ್ತದೆ.',
    },
    isSampleContent: true,
  },
  {
    id: 'q-sci-cir-3',
    subject: 'science',
    grade: 8,
    topicId: 'sci-circuits',
    topicName: {en: 'Electricity & Circuits', kn: 'ವಿದ್ಯುತ್ ಮತ್ತು ಮಂಡಲಗಳು'},
    difficulty: 'advanced',
    prompt: {
      en: 'What happens when a switch is turned OFF in a simple bulb circuit?',
      kn: 'ಸರಳ ಬಲ್ಬ್ ಮಂಡಲದಲ್ಲಿ ಸ್ವಿಚ್ ಆಫ್ ಮಾಡಿದಾಗ ಏನಾಗುತ್ತದೆ?',
    },
    options: [
      {
        en: 'The circuit opens, breaking the continuous path for current',
        kn: 'ಮಂಡಲ ತೆರೆಯುತ್ತದೆ ಮತ್ತು ವಿದ್ಯುತ್ ಪ್ರವಾಹ ನಿಲ್ಲುತ್ತದೆ',
      },
      {en: 'The battery reverses polarity', kn: 'ಬ್ಯಾಟರಿ ದಿಕ್ಕು ಬದಲಾಗುತ್ತದೆ'},
      {en: 'Current flows faster', kn: 'ವಿದ್ಯುತ್ ವೇಗ ಹೆಚ್ಚುತ್ತದೆ'},
      {en: 'Electrons vanish', kn: 'ಎಲೆಕ್ಟ್ರಾನ್‌ಗಳು ನಾಶವಾಗುತ್ತವೆ'},
    ],
    correctIndex: 0,
    explanation: {
      en: 'Turning a switch OFF creates an air gap (open circuit), stopping current flow.',
      kn: 'ಸ್ವಿಚ್ ಆಫ್ ಮಾಡಿದಾಗ ಮಂಡಲದಲ್ಲಿ ಅಂತರ ಉಂಟಾಗಿ ವಿದ್ಯುತ್ ಹರಿಯುವುದು ನಿಲ್ಲುತ್ತದೆ.',
    },
    isSampleContent: true,
  },

  // SCIENCE — Matter
  {
    id: 'q-sci-mat-1',
    subject: 'science',
    grade: 7,
    topicId: 'sci-matter',
    topicName: {en: 'States of Matter & Atoms', kn: 'ದ್ರವ್ಯದ ಸ್ಥಿತಿಗಳು ಮತ್ತು ಪರಮಾಣುಗಳು'},
    difficulty: 'beginner',
    prompt: {
      en: 'In which state of matter are particles packed most closely together?',
      kn: 'ದ್ರವ್ಯದ ಯಾವ ಸ್ಥಿತಿಯಲ್ಲಿ ಕಣಗಳು ಅತ್ಯಂತ ಹತ್ತಿರದಲ್ಲಿ ಜೋಡಣೆಯಾಗಿರುತ್ತವೆ?',
    },
    options: [
      {en: 'Gas', kn: 'ಅನಿಲ'},
      {en: 'Liquid', kn: 'ದ್ರವ'},
      {en: 'Solid', kn: 'ಘನ'},
      {en: 'Steam', kn: 'ಆವಿ'},
    ],
    correctIndex: 2,
    explanation: {
      en: 'Solids have tightly packed particles in fixed positions, giving them a definite shape.',
      kn: 'ಘನ ವಸ್ತುಗಳಲ್ಲಿ ಕಣಗಳು ಬಿಗಿಯಾಗಿ ಜೋಡಣೆಯಾಗಿರುತ್ತವೆ.',
    },
    isSampleContent: true,
  },
  {
    id: 'q-sci-mat-2',
    subject: 'science',
    grade: 8,
    topicId: 'sci-matter',
    topicName: {en: 'States of Matter & Atoms', kn: 'ದ್ರವ್ಯದ ಸ್ಥಿತಿಗಳು ಮತ್ತು ಪರಮಾಣುಗಳು'},
    difficulty: 'intermediate',
    prompt: {
      en: 'Changing water from liquid to water vapour at room temperature is called:',
      kn: 'ಸಾಮಾನ್ಯ ತಾಪಮಾನದಲ್ಲಿ ನೀರು ಆವಿಯಾಗುವ ಪ್ರಕ್ರಿಯೆಯನ್ನು ಏನೆಂದು ಕರೆಯುತ್ತಾರೆ?',
    },
    options: [
      {en: 'Condensation', kn: 'ಸಾಂದ್ರೀಕರಣ'},
      {en: 'Evaporation', kn: 'ಬಾಷ್ಪೀಕರಣ'},
      {en: 'Freezing', kn: 'ಘನೀಕರಣ'},
      {en: 'Sublimation', kn: 'ಉತ್ಪತನ'},
    ],
    correctIndex: 1,
    explanation: {
      en: 'Evaporation occurs at the surface of a liquid below its boiling point.',
      kn: 'ಕುದಿಯುವ ಬಿಂದುಗಿಂತ ಕಡಿಮೆ ತಾಪಮಾನದಲ್ಲಿ ದ್ರವ ಆವಿಯಾಗುವುದು ಬಾಷ್ಪೀಕರಣ.',
    },
    isSampleContent: true,
  },

  // ENGLISH — Tenses
  {
    id: 'q-eng-ten-1',
    subject: 'english',
    grade: 7,
    topicId: 'eng-tenses',
    topicName: {en: 'Verb Tenses & Agreement', kn: 'ಕ್ರಿಯಾಪದ ಕಾಲಗಳು ಮತ್ತು ಹೊಂದಾಣಿಕೆ'},
    difficulty: 'beginner',
    prompt: {
      en: 'Choose the correct verb: "Ananya _____ her science notes every evening."',
      kn: 'ಸರಿಯಾದ ಕ್ರಿಯಾಪದ ಆರಿಸಿ: "Ananya _____ her science notes every evening."',
    },
    options: [
      {en: 'review', kn: 'review'},
      {en: 'reviews', kn: 'reviews'},
      {en: 'reviewing', kn: 'reviewing'},
      {en: 'were review', kn: 'were review'},
    ],
    correctIndex: 1,
    explanation: {
      en: '"Ananya" is a singular third-person subject, so simple present tense takes "-s": "reviews".',
      kn: '"Ananya" ಏಕವಚನ ಕರ್ತೃ ಆದ್ದರಿಂದ ವರ್ತಮಾನ ಕಾಲದಲ್ಲಿ "reviews" ಸರಿ.',
    },
    isSampleContent: true,
  },
  {
    id: 'q-eng-ten-2',
    subject: 'english',
    grade: 7,
    topicId: 'eng-tenses',
    topicName: {en: 'Verb Tenses & Agreement', kn: 'ಕ್ರಿಯಾಪದ ಕಾಲಗಳು ಮತ್ತು ಹೊಂದಾಣಿಕೆ'},
    difficulty: 'intermediate',
    prompt: {
      en: 'Select the past tense sentence:',
      kn: 'ಭೂತಕಾಲದ ವಾಕ್ಯವನ್ನು ಆರಿಸಿ:',
    },
    options: [
      {
        en: 'Yesterday, our class planted twelve saplings.',
        kn: 'Yesterday, our class planted twelve saplings.',
      },
      {
        en: 'Our class plants saplings every July.',
        kn: 'Our class plants saplings every July.',
      },
      {
        en: 'Tomorrow we will water the garden.',
        kn: 'Tomorrow we will water the garden.',
      },
      {
        en: 'Students are watering the garden.',
        kn: 'Students are watering the garden.',
      },
    ],
    correctIndex: 0,
    explanation: {
      en: '"Yesterday" and the verb "planted" indicate a completed past action.',
      kn: '"Yesterday" ಮತ್ತು "planted" ಪದಗಳು ಭೂತಕಾಲವನ್ನು ಸೂಚಿಸುತ್ತವೆ.',
    },
    isSampleContent: true,
  },
  {
    id: 'q-eng-ten-3',
    subject: 'english',
    grade: 8,
    topicId: 'eng-tenses',
    topicName: {en: 'Verb Tenses & Agreement', kn: 'ಕ್ರಿಯಾಪದ ಕಾಲಗಳು ಮತ್ತು ಹೊಂದಾಣಿಕೆ'},
    difficulty: 'advanced',
    prompt: {
      en: 'Choose the correct form: "Neither the teacher nor the students _____ late today."',
      kn: 'ಸರಿಯಾದ ಪದ ಆರಿಸಿ: "Neither the teacher nor the students _____ late today."',
    },
    options: [
      {en: 'was', kn: 'was'},
      {en: 'is', kn: 'is'},
      {en: 'were', kn: 'were'},
      {en: 'has been', kn: 'has been'},
    ],
    correctIndex: 2,
    explanation: {
      en: 'With "neither...nor", the verb agrees with the closer subject ("students", plural), so use "were".',
      kn: '"neither...nor" ಬಳಸಿದಾಗ ಕ್ರಿಯಾಪದವು ಹತ್ತಿರದ ಕರ್ತೃವಿಗೆ ("students" ಬಹುವಚನ) ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ: "were".',
    },
    isSampleContent: true,
  },

  // ENGLISH — Comprehension
  {
    id: 'q-eng-comp-1',
    subject: 'english',
    grade: 7,
    topicId: 'eng-comprehension',
    topicName: {en: 'Reading Comprehension', kn: 'ಓದುವ ಗ್ರಹಿಕೆ'},
    difficulty: 'beginner',
    prompt: {
      en: 'Passage: "A village library set up solar lamps so students could read after sunset without kerosene smoke." What is the main idea?',
      kn: 'ಸಾರಾಂಶ: "ಗ್ರಾಮದ ಗ್ರಂಥಾಲಯವು ಸೌರ ದೀಪಗಳನ್ನು ಅಳವಡಿಸಿದ್ದರಿಂದ ವಿದ್ಯಾರ್ಥಿಗಳು ಸೂರ್ಯಾಸ್ತದ ನಂತರವೂ ಓದಲು ಸಾಧ್ಯವಾಯಿತು." ಮುಖ್ಯ ವಿಚಾರವೇನು?',
    },
    options: [
      {
        en: 'Solar lamps helped students study safely at night',
        kn: 'ಸೌರ ದೀಪಗಳು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ರಾತ್ರಿ ಸುರಕ್ಷಿತವಾಗಿ ಓದಲು ನೆರವಾದವು',
      },
      {
        en: 'Kerosene lamps are cheaper than books',
        kn: 'ಸೀಮೆಎಣ್ಣೆ ದೀಪಗಳು ಪುಸ್ತಕಗಳಿಗಿಂತ ಅಗ್ಗ',
      },
      {
        en: 'Libraries close before sunset',
        kn: 'ಗ್ರಂಥಾಲಯಗಳು ಸೂರ್ಯಾಸ್ತದ ಮೊದಲು ಮುಚ್ಚುತ್ತವೆ',
      },
      {
        en: 'Students dislike reading',
        kn: 'ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಓದು ಇಷ್ಟವಿಲ್ಲ',
      },
    ],
    correctIndex: 0,
    explanation: {
      en: 'The sentence connects solar lamps directly to students being able to read safely after sunset.',
      kn: 'ಸೌರ ದೀಪಗಳಿಂದ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ರಾತ್ರಿ ಓದಲು ಸುರಕ್ಷಿತ ಬೆಳಕು ಸಿಕ್ಕಿತು ಎಂಬುದು ಮುಖ್ಯ ಅಂಶ.',
    },
    isSampleContent: true,
  },
  {
    id: 'q-eng-comp-2',
    subject: 'english',
    grade: 8,
    topicId: 'eng-comprehension',
    topicName: {en: 'Reading Comprehension', kn: 'ಓದುವ ಗ್ರಹಿಕೆ'},
    difficulty: 'intermediate',
    prompt: {
      en: 'In "The river swelled rapidly after three days of monsoon rain," what does "swelled" mean?',
      kn: '"ಮೂರು ದಿನಗಳ ಮಳೆಯ ನಂತರ ನದಿಯು ವೇಗವಾಗಿ swelled ಆಯಿತು" ಎಂಬಲ್ಲಿ "swelled" ಅರ್ಥವೇನು?',
    },
    options: [
      {en: 'Dried up', kn: 'ಒಣಗಿಹೋಯಿತು'},
      {en: 'Rose and expanded in volume', kn: 'ನೀರಿನ ಮಟ್ಟ ಹೆಚ್ಚಾಯಿತು'},
      {en: 'Turned to ice', kn: 'ಮಂಜುಗಡ್ಡೆಯಾಯಿತು'},
      {en: 'Stopped flowing', kn: 'ಹರಿಯುವುದು ನಿಂತಿತು'},
    ],
    correctIndex: 1,
    explanation: {
      en: 'Context clue "three days of monsoon rain" tells us the river water level increased.',
      kn: 'ಮೂರು ದಿನಗಳ ಮಳೆ ಎಂಬ ಸಂದರ್ಭದಿಂದ ನದಿಯ ನೀರು ಹೆಚ್ಚಾಯಿತು ಎಂದು ತಿಳಿಯುತ್ತದೆ.',
    },
    isSampleContent: true,
  },

  // ENGLISH — Sentence Structure
  {
    id: 'q-eng-str-1',
    subject: 'english',
    grade: 7,
    topicId: 'eng-structure',
    topicName: {en: 'Sentence Connectors', kn: 'ವಾಕ್ಯ ಸಂಯೋಜಕಗಳು'},
    difficulty: 'beginner',
    prompt: {
      en: 'Fill in the blank: "_____ the network was offline, Kavya completed her downloaded quiz."',
      kn: 'ಖಾಲಿ ಜಾಗ ತುಂಬಿರಿ: "_____ the network was offline, Kavya completed her downloaded quiz."',
    },
    options: [
      {en: 'Because', kn: 'Because'},
      {en: 'Although', kn: 'Although'},
      {en: 'Therefore', kn: 'Therefore'},
      {en: 'Unless', kn: 'Unless'},
    ],
    correctIndex: 1,
    explanation: {
      en: '"Although" introduces contrast: she completed the quiz despite being offline.',
      kn: 'ಆಫ್‌ಲೈನ್ ಇದ್ದರೂ ಪರೀಕ್ಷೆ ಪೂರ್ಣಗೊಳಿಸಿದಳು ಎಂಬ ವಿರೋಧಾಭಾಸಕ್ಕೆ "Although" ಸೂಕ್ತ.',
    },
    isSampleContent: true,
  },
  {
    id: 'q-eng-str-2',
    subject: 'english',
    grade: 8,
    topicId: 'eng-structure',
    topicName: {en: 'Sentence Connectors', kn: 'ವಾಕ್ಯ ಸಂಯೋಜಕಗಳು'},
    difficulty: 'intermediate',
    prompt: {
      en: 'Fill in the blank: "Rohan practised two beginner lessons; _____, his score jumped to 85%."',
      kn: 'ಖಾಲಿ ಜಾಗ ತುಂಬಿರಿ: "Rohan practised two beginner lessons; _____, his score jumped to 85%."',
    },
    options: [
      {en: 'however', kn: 'however'},
      {en: 'consequently', kn: 'consequently'},
      {en: 'although', kn: 'although'},
      {en: 'whereas', kn: 'whereas'},
    ],
    correctIndex: 1,
    explanation: {
      en: '"Consequently" shows a direct positive result of his practice.',
      kn: 'ಅಭ್ಯಾಸದ ಪರಿಣಾಮವಾಗಿ ಅಂಕ ಹೆಚ್ಚಾಯಿತು ಎಂಬುದನ್ನು "consequently" ತೋರಿಸುತ್ತದೆ.',
    },
    isSampleContent: true,
  },
];
