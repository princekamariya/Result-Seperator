/**
 * db/seed.js
 * Run once: node db/seed.js
 * Seeds all lookup tables: school_standards, school_boards, college_degrees
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mysql = require('mysql2/promise');

// ─── DATA ────────────────────────────────────────────────────────────────────

const schoolStandards = [
  // Pre-School
  { key_name: 'playgroup', value: 'Play Group',               category: 'pre_school',       sort_order: 1  },
  { key_name: 'nursery',   value: 'Nursery',                  category: 'pre_school',       sort_order: 2  },
  { key_name: 'lkg',       value: 'LKG (Lower Kindergarten)', category: 'pre_school',       sort_order: 3  },
  { key_name: 'ukg',       value: 'UKG (Upper Kindergarten)', category: 'pre_school',       sort_order: 4  },
  { key_name: 'junior',    value: 'Junior',                   category: 'pre_school',       sort_order: 5  },
  { key_name: 'senior',    value: 'Senior',                   category: 'pre_school',       sort_order: 6  },
  // Primary
  { key_name: '1',         value: '1st Standard',             category: 'primary',          sort_order: 10 },
  { key_name: '2',         value: '2nd Standard',             category: 'primary',          sort_order: 11 },
  { key_name: '3',         value: '3rd Standard',             category: 'primary',          sort_order: 12 },
  { key_name: '4',         value: '4th Standard',             category: 'primary',          sort_order: 13 },
  { key_name: '5',         value: '5th Standard',             category: 'primary',          sort_order: 14 },
  // Middle School
  { key_name: '6',         value: '6th Standard',             category: 'middle',           sort_order: 20 },
  { key_name: '7',         value: '7th Standard',             category: 'middle',           sort_order: 21 },
  { key_name: '8',         value: '8th Standard',             category: 'middle',           sort_order: 22 },
  // Secondary
  { key_name: '9',         value: '9th Standard',             category: 'secondary',        sort_order: 30 },
  { key_name: '10',        value: '10th Standard',            category: 'secondary',        sort_order: 31 },
  // Higher Secondary
  { key_name: '11-science',  value: '11th — Science',  category: 'higher_secondary', sort_order: 40 },
  { key_name: '11-commerce', value: '11th — Commerce', category: 'higher_secondary', sort_order: 41 },
  { key_name: '11-arts',     value: '11th — Arts',     category: 'higher_secondary', sort_order: 42 },
  { key_name: '12-science',  value: '12th — Science',  category: 'higher_secondary', sort_order: 43 },
  { key_name: '12-commerce', value: '12th — Commerce', category: 'higher_secondary', sort_order: 44 },
  { key_name: '12-arts',     value: '12th — Arts',     category: 'higher_secondary', sort_order: 45 },
];

const schoolBoards = [
  { key_name: 'GSEB', value: 'GSEB (Gujarat Secondary and Higher Secondary Education Board)' },
  { key_name: 'CBSE', value: 'CBSE (Central Board of Secondary Education)'                  },
  { key_name: 'ICSE', value: 'ICSE (Indian Certificate of Secondary Education)'             },
];

const collegeDegrees = [
  // ─── ENGINEERING & TECHNOLOGY ───────────────────────────────────────────────
  { key_name: 'be_computer_engineering',  value: 'B.E. / B.Tech - Computer Engineering',                      category: 'engineering', sort_order: 10  },
  { key_name: 'be_cse',                   value: 'B.E. / B.Tech - Computer Science & Engineering',             category: 'engineering', sort_order: 11  },
  { key_name: 'be_it',                    value: 'B.E. / B.Tech - Information Technology',                     category: 'engineering', sort_order: 12  },
  { key_name: 'be_aiml',                  value: 'B.E. / B.Tech - Artificial Intelligence & Machine Learning', category: 'engineering', sort_order: 13  },
  { key_name: 'be_data_science',          value: 'B.E. / B.Tech - Data Science',                              category: 'engineering', sort_order: 14  },
  { key_name: 'be_cyber_security',        value: 'B.E. / B.Tech - Cyber Security',                            category: 'engineering', sort_order: 15  },
  { key_name: 'be_ece',                   value: 'B.E. / B.Tech - Electronics & Communication Engineering',    category: 'engineering', sort_order: 16  },
  { key_name: 'be_electrical',            value: 'B.E. / B.Tech - Electrical Engineering',                    category: 'engineering', sort_order: 17  },
  { key_name: 'be_eee',                   value: 'B.E. / B.Tech - Electrical & Electronics Engineering',      category: 'engineering', sort_order: 18  },
  { key_name: 'be_mechanical',            value: 'B.E. / B.Tech - Mechanical Engineering',                    category: 'engineering', sort_order: 19  },
  { key_name: 'be_automobile',            value: 'B.E. / B.Tech - Automobile Engineering',                    category: 'engineering', sort_order: 20  },
  { key_name: 'be_aerospace',             value: 'B.E. / B.Tech - Aerospace Engineering',                     category: 'engineering', sort_order: 21  },
  { key_name: 'be_aeronautical',          value: 'B.E. / B.Tech - Aeronautical Engineering',                  category: 'engineering', sort_order: 22  },
  { key_name: 'be_civil',                 value: 'B.E. / B.Tech - Civil Engineering',                         category: 'engineering', sort_order: 23  },
  { key_name: 'be_structural',            value: 'B.E. / B.Tech - Structural Engineering',                    category: 'engineering', sort_order: 24  },
  { key_name: 'be_environmental',         value: 'B.E. / B.Tech - Environmental Engineering',                 category: 'engineering', sort_order: 25  },
  { key_name: 'be_chemical',              value: 'B.E. / B.Tech - Chemical Engineering',                      category: 'engineering', sort_order: 26  },
  { key_name: 'be_petroleum',             value: 'B.E. / B.Tech - Petroleum Engineering',                     category: 'engineering', sort_order: 27  },
  { key_name: 'be_biotech',               value: 'B.E. / B.Tech - Biotechnology Engineering',                 category: 'engineering', sort_order: 28  },
  { key_name: 'be_biomedical',            value: 'B.E. / B.Tech - Biomedical Engineering',                    category: 'engineering', sort_order: 29  },
  { key_name: 'be_agricultural',          value: 'B.E. / B.Tech - Agricultural Engineering',                  category: 'engineering', sort_order: 30  },
  { key_name: 'be_mining',                value: 'B.E. / B.Tech - Mining Engineering',                        category: 'engineering', sort_order: 31  },
  { key_name: 'be_metallurgical',         value: 'B.E. / B.Tech - Metallurgical Engineering',                 category: 'engineering', sort_order: 32  },
  { key_name: 'be_industrial',            value: 'B.E. / B.Tech - Industrial Engineering',                    category: 'engineering', sort_order: 33  },
  { key_name: 'be_production',            value: 'B.E. / B.Tech - Production Engineering',                    category: 'engineering', sort_order: 34  },
  { key_name: 'be_textile',               value: 'B.E. / B.Tech - Textile Engineering',                       category: 'engineering', sort_order: 35  },
  { key_name: 'be_instrumentation',       value: 'B.E. / B.Tech - Instrumentation Engineering',               category: 'engineering', sort_order: 36  },
  { key_name: 'be_robotics',              value: 'B.E. / B.Tech - Robotics & Automation',                     category: 'engineering', sort_order: 37  },
  { key_name: 'be_marine',                value: 'B.E. / B.Tech - Marine Engineering',                        category: 'engineering', sort_order: 38  },
  { key_name: 'be_naval',                 value: 'B.E. / B.Tech - Naval Architecture',                        category: 'engineering', sort_order: 39  },
  { key_name: 'me_cse',                   value: 'M.E. / M.Tech - Computer Science & Engineering',             category: 'engineering', sort_order: 50  },
  { key_name: 'me_ai',                    value: 'M.E. / M.Tech - Artificial Intelligence',                   category: 'engineering', sort_order: 51  },
  { key_name: 'me_data_science',          value: 'M.E. / M.Tech - Data Science & Engineering',                category: 'engineering', sort_order: 52  },
  { key_name: 'me_vlsi',                  value: 'M.E. / M.Tech - VLSI Design',                               category: 'engineering', sort_order: 53  },
  { key_name: 'me_embedded',              value: 'M.E. / M.Tech - Embedded Systems',                          category: 'engineering', sort_order: 54  },
  { key_name: 'me_mechanical',            value: 'M.E. / M.Tech - Mechanical Engineering',                    category: 'engineering', sort_order: 55  },
  { key_name: 'me_structural',            value: 'M.E. / M.Tech - Structural Engineering',                    category: 'engineering', sort_order: 56  },
  { key_name: 'me_environmental',         value: 'M.E. / M.Tech - Environmental Engineering',                 category: 'engineering', sort_order: 57  },
  { key_name: 'me_thermal',               value: 'M.E. / M.Tech - Thermal Engineering',                       category: 'engineering', sort_order: 58  },
  { key_name: 'me_power_systems',         value: 'M.E. / M.Tech - Power Systems',                             category: 'engineering', sort_order: 59  },
  { key_name: 'me_biotech',               value: 'M.E. / M.Tech - Biotechnology',                             category: 'engineering', sort_order: 60  },
  { key_name: 'me_chemical',              value: 'M.E. / M.Tech - Chemical Engineering',                      category: 'engineering', sort_order: 61  },

  // ─── MEDICINE & HEALTH SCIENCES ─────────────────────────────────────────────
  { key_name: 'mbbs',            value: 'MBBS - Bachelor of Medicine & Bachelor of Surgery',          category: 'medicine', sort_order: 10 },
  { key_name: 'bds',             value: 'BDS - Bachelor of Dental Surgery',                           category: 'medicine', sort_order: 11 },
  { key_name: 'bams',            value: 'BAMS - Bachelor of Ayurvedic Medicine & Surgery',            category: 'medicine', sort_order: 12 },
  { key_name: 'bhms',            value: 'BHMS - Bachelor of Homeopathic Medicine & Surgery',          category: 'medicine', sort_order: 13 },
  { key_name: 'bums',            value: 'BUMS - Bachelor of Unani Medicine & Surgery',                category: 'medicine', sort_order: 14 },
  { key_name: 'bnys',            value: 'BNYS - Bachelor of Naturopathy & Yogic Sciences',            category: 'medicine', sort_order: 15 },
  { key_name: 'bpharm',          value: 'B.Pharm - Bachelor of Pharmacy',                             category: 'medicine', sort_order: 16 },
  { key_name: 'pharmd',          value: 'Pharm.D - Doctor of Pharmacy',                               category: 'medicine', sort_order: 17 },
  { key_name: 'bpt',             value: 'BPT - Bachelor of Physiotherapy',                            category: 'medicine', sort_order: 18 },
  { key_name: 'bot',             value: 'BOT - Bachelor of Occupational Therapy',                     category: 'medicine', sort_order: 19 },
  { key_name: 'bsc_nursing',     value: 'B.Sc. Nursing',                                              category: 'medicine', sort_order: 20 },
  { key_name: 'gnm',             value: 'GNM - General Nursing & Midwifery',                          category: 'medicine', sort_order: 21 },
  { key_name: 'anm',             value: 'ANM - Auxiliary Nursing & Midwifery',                        category: 'medicine', sort_order: 22 },
  { key_name: 'bmlt',            value: 'BMLT - Bachelor of Medical Lab Technology',                  category: 'medicine', sort_order: 23 },
  { key_name: 'bsc_mit',         value: 'B.Sc. Medical Imaging Technology',                           category: 'medicine', sort_order: 24 },
  { key_name: 'bsc_radiology',   value: 'B.Sc. Radiology & Imaging Technology',                      category: 'medicine', sort_order: 25 },
  { key_name: 'bsc_ott',         value: 'B.Sc. Operation Theatre Technology',                         category: 'medicine', sort_order: 26 },
  { key_name: 'bsc_optometry',   value: 'B.Sc. Optometry',                                           category: 'medicine', sort_order: 27 },
  { key_name: 'bsc_audiology',   value: 'B.Sc. Audiology & Speech-Language Pathology',               category: 'medicine', sort_order: 28 },
  { key_name: 'bvsc',            value: 'BVSc & AH - Bachelor of Veterinary Science',                 category: 'medicine', sort_order: 29 },
  { key_name: 'md',              value: 'MD - Doctor of Medicine',                                    category: 'medicine', sort_order: 40 },
  { key_name: 'ms_surgery',      value: 'MS - Master of Surgery',                                     category: 'medicine', sort_order: 41 },
  { key_name: 'mds',             value: 'MDS - Master of Dental Surgery',                             category: 'medicine', sort_order: 42 },
  { key_name: 'mpharm',          value: 'M.Pharm - Master of Pharmacy',                               category: 'medicine', sort_order: 43 },
  { key_name: 'mpt',             value: 'MPT - Master of Physiotherapy',                              category: 'medicine', sort_order: 44 },
  { key_name: 'msc_nursing',     value: 'M.Sc. Nursing',                                              category: 'medicine', sort_order: 45 },
  { key_name: 'dm',              value: 'DM - Doctorate of Medicine (Super Specialty)',                category: 'medicine', sort_order: 46 },
  { key_name: 'mch',             value: 'MCh - Master of Chirurgiae (Super Specialty Surgery)',       category: 'medicine', sort_order: 47 },

  // ─── LAW ────────────────────────────────────────────────────────────────────
  { key_name: 'llb_3',              value: 'LL.B. - Bachelor of Laws (3-Year)',                            category: 'law', sort_order: 10 },
  { key_name: 'ba_llb',             value: 'B.A. LL.B. - Law with Arts (5-Year Integrated)',               category: 'law', sort_order: 11 },
  { key_name: 'bcom_llb',           value: 'B.Com. LL.B. - Law with Commerce (5-Year Integrated)',         category: 'law', sort_order: 12 },
  { key_name: 'bsc_llb',            value: 'B.Sc. LL.B. - Law with Science (5-Year Integrated)',           category: 'law', sort_order: 13 },
  { key_name: 'bba_llb',            value: 'BBA LL.B. - Law with Business Administration (5-Year)',        category: 'law', sort_order: 14 },
  { key_name: 'btech_llb',          value: 'B.Tech LL.B. - Law with Technology (5-Year)',                  category: 'law', sort_order: 15 },
  { key_name: 'llm',                value: 'LL.M. - Master of Laws',                                       category: 'law', sort_order: 20 },
  { key_name: 'llm_corporate',      value: 'LL.M. - Corporate & Commercial Law',                           category: 'law', sort_order: 21 },
  { key_name: 'llm_criminal',       value: 'LL.M. - Criminal Law',                                        category: 'law', sort_order: 22 },
  { key_name: 'llm_constitutional', value: 'LL.M. - Constitutional Law',                                   category: 'law', sort_order: 23 },
  { key_name: 'llm_international',  value: 'LL.M. - International Law',                                    category: 'law', sort_order: 24 },
  { key_name: 'llm_ip',             value: 'LL.M. - Intellectual Property Law',                            category: 'law', sort_order: 25 },
  { key_name: 'llm_cyber',          value: 'LL.M. - Cyber Law',                                            category: 'law', sort_order: 26 },
  { key_name: 'llm_human_rights',   value: 'LL.M. - Human Rights Law',                                     category: 'law', sort_order: 27 },
  { key_name: 'lld',                value: 'LL.D. - Doctor of Laws',                                       category: 'law', sort_order: 30 },

  // ─── MANAGEMENT & BUSINESS ──────────────────────────────────────────────────
  { key_name: 'bba',              value: 'BBA - Bachelor of Business Administration',       category: 'management', sort_order: 10 },
  { key_name: 'bba_finance',      value: 'BBA - Finance',                                  category: 'management', sort_order: 11 },
  { key_name: 'bba_marketing',    value: 'BBA - Marketing',                                category: 'management', sort_order: 12 },
  { key_name: 'bba_hr',           value: 'BBA - Human Resource Management',                category: 'management', sort_order: 13 },
  { key_name: 'bba_ib',           value: 'BBA - International Business',                   category: 'management', sort_order: 14 },
  { key_name: 'bba_logistics',    value: 'BBA - Logistics & Supply Chain',                 category: 'management', sort_order: 15 },
  { key_name: 'bms',              value: 'BMS - Bachelor of Management Studies',           category: 'management', sort_order: 16 },
  { key_name: 'bcom_general',     value: 'B.Com. - General',                               category: 'management', sort_order: 17 },
  { key_name: 'bcom_af',          value: 'B.Com. - Accounting & Finance',                  category: 'management', sort_order: 18 },
  { key_name: 'bcom_bi',          value: 'B.Com. - Banking & Insurance',                   category: 'management', sort_order: 19 },
  { key_name: 'bcom_fm',          value: 'B.Com. - Financial Markets',                     category: 'management', sort_order: 20 },
  { key_name: 'bcom_taxation',    value: 'B.Com. - Taxation',                              category: 'management', sort_order: 21 },
  { key_name: 'bcom_ca',          value: 'B.Com. - Computer Applications',                 category: 'management', sort_order: 22 },
  { key_name: 'mba_general',      value: 'MBA - General Management',                       category: 'management', sort_order: 30 },
  { key_name: 'mba_finance',      value: 'MBA - Finance',                                  category: 'management', sort_order: 31 },
  { key_name: 'mba_marketing',    value: 'MBA - Marketing',                                category: 'management', sort_order: 32 },
  { key_name: 'mba_hr',           value: 'MBA - Human Resource Management',                category: 'management', sort_order: 33 },
  { key_name: 'mba_operations',   value: 'MBA - Operations Management',                    category: 'management', sort_order: 34 },
  { key_name: 'mba_it',           value: 'MBA - Information Technology',                   category: 'management', sort_order: 35 },
  { key_name: 'mba_ib',           value: 'MBA - International Business',                   category: 'management', sort_order: 36 },
  { key_name: 'mba_scm',          value: 'MBA - Supply Chain & Logistics',                 category: 'management', sort_order: 37 },
  { key_name: 'mba_healthcare',   value: 'MBA - Healthcare Management',                    category: 'management', sort_order: 38 },
  { key_name: 'mba_rural',        value: 'MBA - Rural Management',                         category: 'management', sort_order: 39 },
  { key_name: 'mba_agri',         value: 'MBA - Agri Business',                            category: 'management', sort_order: 40 },
  { key_name: 'mba_analytics',    value: 'MBA - Business Analytics',                       category: 'management', sort_order: 41 },
  { key_name: 'mba_entrepreneurship', value: 'MBA - Entrepreneurship',                     category: 'management', sort_order: 42 },
  { key_name: 'pgdm',             value: 'PGDM - Post Graduate Diploma in Management',     category: 'management', sort_order: 43 },
  { key_name: 'mcom_general',     value: 'M.Com. - General',                               category: 'management', sort_order: 44 },
  { key_name: 'mcom_finance',     value: 'M.Com. - Finance & Taxation',                    category: 'management', sort_order: 45 },
  { key_name: 'mcom_accounting',  value: 'M.Com. - Accounting',                            category: 'management', sort_order: 46 },

  // ─── COMPUTER SCIENCE & IT ──────────────────────────────────────────────────
  { key_name: 'bca',          value: 'BCA - Bachelor of Computer Applications',             category: 'computer_it', sort_order: 10 },
  { key_name: 'bca_cloud',    value: 'BCA - Cloud Computing',                               category: 'computer_it', sort_order: 11 },
  { key_name: 'bca_ds',       value: 'BCA - Data Science',                                  category: 'computer_it', sort_order: 12 },
  { key_name: 'bsc_cs',       value: 'B.Sc. - Computer Science',                            category: 'computer_it', sort_order: 13 },
  { key_name: 'bsc_it',       value: 'B.Sc. - Information Technology',                      category: 'computer_it', sort_order: 14 },
  { key_name: 'bsc_ds',       value: 'B.Sc. - Data Science',                                category: 'computer_it', sort_order: 15 },
  { key_name: 'bsc_ai',       value: 'B.Sc. - Artificial Intelligence',                     category: 'computer_it', sort_order: 16 },
  { key_name: 'bsc_cyber',    value: 'B.Sc. - Cyber Security',                              category: 'computer_it', sort_order: 17 },
  { key_name: 'bsc_software', value: 'B.Sc. - Software Development',                        category: 'computer_it', sort_order: 18 },
  { key_name: 'mca',          value: 'MCA - Master of Computer Applications',               category: 'computer_it', sort_order: 20 },
  { key_name: 'msc_cs',       value: 'M.Sc. - Computer Science',                            category: 'computer_it', sort_order: 21 },
  { key_name: 'msc_it',       value: 'M.Sc. - Information Technology',                      category: 'computer_it', sort_order: 22 },
  { key_name: 'msc_ds',       value: 'M.Sc. - Data Science',                                category: 'computer_it', sort_order: 23 },
  { key_name: 'msc_aiml',     value: 'M.Sc. - Artificial Intelligence & Machine Learning',  category: 'computer_it', sort_order: 24 },
  { key_name: 'msc_cyber',    value: 'M.Sc. - Cyber Security',                              category: 'computer_it', sort_order: 25 },

  // ─── SCIENCE ────────────────────────────────────────────────────────────────
  { key_name: 'bsc_physics',    value: 'B.Sc. - Physics',              category: 'science', sort_order: 10 },
  { key_name: 'bsc_chemistry',  value: 'B.Sc. - Chemistry',            category: 'science', sort_order: 11 },
  { key_name: 'bsc_maths',      value: 'B.Sc. - Mathematics',          category: 'science', sort_order: 12 },
  { key_name: 'bsc_stats',      value: 'B.Sc. - Statistics',           category: 'science', sort_order: 13 },
  { key_name: 'bsc_biology',    value: 'B.Sc. - Biology',              category: 'science', sort_order: 14 },
  { key_name: 'bsc_micro',      value: 'B.Sc. - Microbiology',         category: 'science', sort_order: 15 },
  { key_name: 'bsc_biochem',    value: 'B.Sc. - Biochemistry',         category: 'science', sort_order: 16 },
  { key_name: 'bsc_biotech',    value: 'B.Sc. - Biotechnology',        category: 'science', sort_order: 17 },
  { key_name: 'bsc_genetics',   value: 'B.Sc. - Genetics',             category: 'science', sort_order: 18 },
  { key_name: 'bsc_zoology',    value: 'B.Sc. - Zoology',              category: 'science', sort_order: 19 },
  { key_name: 'bsc_botany',     value: 'B.Sc. - Botany',               category: 'science', sort_order: 20 },
  { key_name: 'bsc_env',        value: 'B.Sc. - Environmental Science', category: 'science', sort_order: 21 },
  { key_name: 'bsc_agri',       value: 'B.Sc. - Agriculture',          category: 'science', sort_order: 22 },
  { key_name: 'bsc_hort',       value: 'B.Sc. - Horticulture',         category: 'science', sort_order: 23 },
  { key_name: 'bsc_forensic',   value: 'B.Sc. - Forensic Science',     category: 'science', sort_order: 24 },
  { key_name: 'bsc_food',       value: 'B.Sc. - Food Science & Technology', category: 'science', sort_order: 25 },
  { key_name: 'bsc_nautical',   value: 'B.Sc. - Nautical Science',     category: 'science', sort_order: 26 },
  { key_name: 'bsc_home',       value: 'B.Sc. - Home Science',         category: 'science', sort_order: 27 },
  { key_name: 'msc_physics',    value: 'M.Sc. - Physics',              category: 'science', sort_order: 30 },
  { key_name: 'msc_chemistry',  value: 'M.Sc. - Chemistry',            category: 'science', sort_order: 31 },
  { key_name: 'msc_maths',      value: 'M.Sc. - Mathematics',          category: 'science', sort_order: 32 },
  { key_name: 'msc_stats',      value: 'M.Sc. - Statistics',           category: 'science', sort_order: 33 },
  { key_name: 'msc_biotech',    value: 'M.Sc. - Biotechnology',        category: 'science', sort_order: 34 },
  { key_name: 'msc_micro',      value: 'M.Sc. - Microbiology',         category: 'science', sort_order: 35 },
  { key_name: 'msc_env',        value: 'M.Sc. - Environmental Science', category: 'science', sort_order: 36 },
  { key_name: 'msc_forensic',   value: 'M.Sc. - Forensic Science',     category: 'science', sort_order: 37 },
  { key_name: 'msc_agri',       value: 'M.Sc. - Agriculture',          category: 'science', sort_order: 38 },

  // ─── ARTS & HUMANITIES ──────────────────────────────────────────────────────
  { key_name: 'ba_english',    value: 'B.A. - English Literature',             category: 'arts_humanities', sort_order: 10 },
  { key_name: 'ba_hindi',      value: 'B.A. - Hindi Literature',               category: 'arts_humanities', sort_order: 11 },
  { key_name: 'ba_gujarati',   value: 'B.A. - Gujarati Literature',            category: 'arts_humanities', sort_order: 12 },
  { key_name: 'ba_sanskrit',   value: 'B.A. - Sanskrit',                       category: 'arts_humanities', sort_order: 13 },
  { key_name: 'ba_history',    value: 'B.A. - History',                        category: 'arts_humanities', sort_order: 14 },
  { key_name: 'ba_geography',  value: 'B.A. - Geography',                      category: 'arts_humanities', sort_order: 15 },
  { key_name: 'ba_polsci',     value: 'B.A. - Political Science',              category: 'arts_humanities', sort_order: 16 },
  { key_name: 'ba_economics',  value: 'B.A. - Economics',                      category: 'arts_humanities', sort_order: 17 },
  { key_name: 'ba_sociology',  value: 'B.A. - Sociology',                      category: 'arts_humanities', sort_order: 18 },
  { key_name: 'ba_psychology', value: 'B.A. - Psychology',                     category: 'arts_humanities', sort_order: 19 },
  { key_name: 'ba_philosophy', value: 'B.A. - Philosophy',                     category: 'arts_humanities', sort_order: 20 },
  { key_name: 'ba_pub_admin',  value: 'B.A. - Public Administration',          category: 'arts_humanities', sort_order: 21 },
  { key_name: 'ba_social_work', value: 'B.A. - Social Work',                   category: 'arts_humanities', sort_order: 22 },
  { key_name: 'ba_journalism', value: 'B.A. - Journalism & Mass Communication', category: 'arts_humanities', sort_order: 23 },
  { key_name: 'ba_rural',      value: 'B.A. - Rural Development',              category: 'arts_humanities', sort_order: 24 },
  { key_name: 'ma_english',    value: 'M.A. - English Literature',             category: 'arts_humanities', sort_order: 30 },
  { key_name: 'ma_hindi',      value: 'M.A. - Hindi Literature',               category: 'arts_humanities', sort_order: 31 },
  { key_name: 'ma_history',    value: 'M.A. - History',                        category: 'arts_humanities', sort_order: 32 },
  { key_name: 'ma_geography',  value: 'M.A. - Geography',                      category: 'arts_humanities', sort_order: 33 },
  { key_name: 'ma_polsci',     value: 'M.A. - Political Science',              category: 'arts_humanities', sort_order: 34 },
  { key_name: 'ma_economics',  value: 'M.A. - Economics',                      category: 'arts_humanities', sort_order: 35 },
  { key_name: 'ma_sociology',  value: 'M.A. - Sociology',                      category: 'arts_humanities', sort_order: 36 },
  { key_name: 'ma_psychology', value: 'M.A. - Psychology',                     category: 'arts_humanities', sort_order: 37 },
  { key_name: 'ma_pub_admin',  value: 'M.A. - Public Administration',          category: 'arts_humanities', sort_order: 38 },
  { key_name: 'ma_journalism', value: 'M.A. - Journalism & Mass Communication', category: 'arts_humanities', sort_order: 39 },
  { key_name: 'msw',           value: 'M.A. - Social Work (MSW)',              category: 'arts_humanities', sort_order: 40 },

  // ─── EDUCATION ──────────────────────────────────────────────────────────────
  { key_name: 'bed',        value: 'B.Ed. - Bachelor of Education',          category: 'education', sort_order: 10 },
  { key_name: 'bed_special', value: 'B.Ed. - Special Education',             category: 'education', sort_order: 11 },
  { key_name: 'med',        value: 'M.Ed. - Master of Education',            category: 'education', sort_order: 12 },
  { key_name: 'bped',       value: 'B.P.Ed. - Bachelor of Physical Education', category: 'education', sort_order: 13 },
  { key_name: 'mped',       value: 'M.P.Ed. - Master of Physical Education', category: 'education', sort_order: 14 },
  { key_name: 'deled',      value: 'D.El.Ed. - Diploma in Elementary Education', category: 'education', sort_order: 15 },
  { key_name: 'beled',      value: 'B.El.Ed. - Bachelor of Elementary Education', category: 'education', sort_order: 16 },
  { key_name: 'ntt',        value: 'NTT - Nursery Teacher Training',         category: 'education', sort_order: 17 },

  // ─── ARCHITECTURE & DESIGN ──────────────────────────────────────────────────
  { key_name: 'barch',           value: 'B.Arch. - Bachelor of Architecture',                   category: 'architecture_design', sort_order: 10 },
  { key_name: 'march',           value: 'M.Arch. - Master of Architecture',                     category: 'architecture_design', sort_order: 11 },
  { key_name: 'bdes_graphic',    value: 'B.Des. - Bachelor of Design (Graphic Design)',          category: 'architecture_design', sort_order: 12 },
  { key_name: 'bdes_interior',   value: 'B.Des. - Bachelor of Design (Interior Design)',         category: 'architecture_design', sort_order: 13 },
  { key_name: 'bdes_fashion',    value: 'B.Des. - Bachelor of Design (Fashion Design)',          category: 'architecture_design', sort_order: 14 },
  { key_name: 'bdes_product',    value: 'B.Des. - Bachelor of Design (Product Design)',          category: 'architecture_design', sort_order: 15 },
  { key_name: 'bdes_animation',  value: 'B.Des. - Bachelor of Design (Animation & Multimedia)',  category: 'architecture_design', sort_order: 16 },
  { key_name: 'bdes_ux',         value: 'B.Des. - Bachelor of Design (UI/UX Design)',            category: 'architecture_design', sort_order: 17 },
  { key_name: 'bdes_textile',    value: 'B.Des. - Bachelor of Design (Textile Design)',          category: 'architecture_design', sort_order: 18 },
  { key_name: 'mdes',            value: 'M.Des. - Master of Design',                            category: 'architecture_design', sort_order: 19 },
  { key_name: 'bfa',             value: 'B.F.A. - Bachelor of Fine Arts',                       category: 'architecture_design', sort_order: 20 },
  { key_name: 'mfa',             value: 'M.F.A. - Master of Fine Arts',                         category: 'architecture_design', sort_order: 21 },
  { key_name: 'bplan',           value: 'B.Plan. - Bachelor of Planning (Urban & Regional)',     category: 'architecture_design', sort_order: 22 },

  // ─── AGRICULTURE & ALLIED SCIENCES ──────────────────────────────────────────
  { key_name: 'bsc_agri_4yr',     value: 'B.Sc. Agriculture (4-Year)',             category: 'agriculture', sort_order: 10 },
  { key_name: 'bsc_horticulture', value: 'B.Sc. Horticulture',                     category: 'agriculture', sort_order: 11 },
  { key_name: 'bsc_forestry',     value: 'B.Sc. Forestry',                         category: 'agriculture', sort_order: 12 },
  { key_name: 'bsc_fisheries',    value: 'B.Sc. Fisheries Science',                category: 'agriculture', sort_order: 13 },
  { key_name: 'bsc_sericulture',  value: 'B.Sc. Sericulture',                      category: 'agriculture', sort_order: 14 },
  { key_name: 'bsc_foodtech',     value: 'B.Sc. Food Technology',                  category: 'agriculture', sort_order: 15 },
  { key_name: 'bsc_dairy',        value: 'B.Sc. Dairy Technology',                 category: 'agriculture', sort_order: 16 },
  { key_name: 'btech_agri_engg',  value: 'B.Tech - Agricultural Engineering',      category: 'agriculture', sort_order: 17 },
  { key_name: 'btech_food',       value: 'B.Tech - Food Technology',               category: 'agriculture', sort_order: 18 },
  { key_name: 'msc_agri_pg',      value: 'M.Sc. Agriculture',                      category: 'agriculture', sort_order: 19 },
  { key_name: 'msc_horticulture', value: 'M.Sc. Horticulture',                     category: 'agriculture', sort_order: 20 },
  { key_name: 'mba_agribiz',      value: 'MBA - Agribusiness Management',          category: 'agriculture', sort_order: 21 },

  // ─── CHARTERED & PROFESSIONAL ACCOUNTANCY ───────────────────────────────────
  { key_name: 'ca',    value: 'CA - Chartered Accountancy (ICAI)',                     category: 'professional', sort_order: 10 },
  { key_name: 'cma',   value: 'CMA - Cost & Management Accountancy (ICMAI)',           category: 'professional', sort_order: 11 },
  { key_name: 'cs',    value: 'CS - Company Secretary (ICSI)',                         category: 'professional', sort_order: 12 },
  { key_name: 'cfa',   value: 'CFA - Chartered Financial Analyst',                    category: 'professional', sort_order: 13 },
  { key_name: 'cfp',   value: 'CFP - Certified Financial Planner',                    category: 'professional', sort_order: 14 },
  { key_name: 'acca',  value: 'ACCA - Association of Chartered Certified Accountants', category: 'professional', sort_order: 15 },
  { key_name: 'cia',   value: 'CIA - Certified Internal Auditor',                     category: 'professional', sort_order: 16 },

  // ─── HOTEL MANAGEMENT & HOSPITALITY ─────────────────────────────────────────
  { key_name: 'bsc_hotel',       value: 'B.Sc. - Hotel Management & Catering Technology', category: 'hospitality', sort_order: 10 },
  { key_name: 'bhm',             value: 'BHM - Bachelor of Hotel Management',             category: 'hospitality', sort_order: 11 },
  { key_name: 'bhmct',           value: 'BHMCT - Bachelor of Hotel Management & Catering Tech.', category: 'hospitality', sort_order: 12 },
  { key_name: 'bsc_hospitality', value: 'B.Sc. - Hospitality & Tourism',                 category: 'hospitality', sort_order: 13 },
  { key_name: 'mhm',             value: 'MHM - Master of Hotel Management',               category: 'hospitality', sort_order: 14 },
  { key_name: 'mba_hospitality', value: 'MBA - Hospitality & Tourism Management',         category: 'hospitality', sort_order: 15 },

  // ─── MEDIA, JOURNALISM & COMMUNICATION ──────────────────────────────────────
  { key_name: 'bjmc',     value: 'BJMC - Bachelor of Journalism & Mass Communication',  category: 'media', sort_order: 10 },
  { key_name: 'bsc_media', value: 'B.Sc. - Mass Communication & Media Technology',     category: 'media', sort_order: 11 },
  { key_name: 'bmm',      value: 'BMM - Bachelor of Mass Media',                        category: 'media', sort_order: 12 },
  { key_name: 'mjmc',     value: 'MJMC - Master of Journalism & Mass Communication',    category: 'media', sort_order: 13 },
  { key_name: 'ma_media', value: 'M.A. - Media Studies',                               category: 'media', sort_order: 14 },
  { key_name: 'pgd_pr',   value: 'PG Diploma - Advertising & Public Relations',         category: 'media', sort_order: 15 },

  // ─── SOCIAL SCIENCES & PUBLIC POLICY ────────────────────────────────────────
  { key_name: 'bsw',        value: 'BSW - Bachelor of Social Work',    category: 'social_sciences', sort_order: 10 },
  { key_name: 'msw_pg',     value: 'MSW - Master of Social Work',      category: 'social_sciences', sort_order: 11 },
  { key_name: 'mpp',        value: 'MPP - Master of Public Policy',    category: 'social_sciences', sort_order: 12 },
  { key_name: 'mpa',        value: 'MPA - Master of Public Administration', category: 'social_sciences', sort_order: 13 },
  { key_name: 'bsc_social', value: 'B.Sc. - Social Sciences',         category: 'social_sciences', sort_order: 14 },

  // ─── PERFORMING & VISUAL ARTS ────────────────────────────────────────────────
  { key_name: 'ba_music_vocal', value: 'B.A. - Music (Vocal)',         category: 'arts', sort_order: 10 },
  { key_name: 'ba_music_inst',  value: 'B.A. - Music (Instrumental)', category: 'arts', sort_order: 11 },
  { key_name: 'ba_dance',       value: 'B.A. - Dance',                category: 'arts', sort_order: 12 },
  { key_name: 'ba_theatre',     value: 'B.A. - Theatre & Drama',      category: 'arts', sort_order: 13 },
  { key_name: 'ba_film',        value: 'B.A. - Film Studies',         category: 'arts', sort_order: 14 },
  { key_name: 'ma_music',       value: 'M.A. - Music',                category: 'arts', sort_order: 15 },
  { key_name: 'ma_dance',       value: 'M.A. - Dance',                category: 'arts', sort_order: 16 },
  { key_name: 'ma_theatre',     value: 'M.A. - Theatre Arts',         category: 'arts', sort_order: 17 },

  // ─── LIBRARY & INFORMATION SCIENCE ──────────────────────────────────────────
  { key_name: 'blib', value: 'B.Lib.I.Sc. - Bachelor of Library & Information Science', category: 'library', sort_order: 10 },
  { key_name: 'mlib', value: 'M.Lib.I.Sc. - Master of Library & Information Science',   category: 'library', sort_order: 11 },

  // ─── DEFENCE & UNIFORMED SERVICES ───────────────────────────────────────────
  { key_name: 'bsc_defence',  value: 'B.Sc. - Defence Studies',               category: 'defence', sort_order: 10 },
  { key_name: 'msc_defence',  value: 'M.Sc. - Defence & Strategic Studies',   category: 'defence', sort_order: 11 },
  { key_name: 'bsc_maritime', value: 'B.Sc. - Maritime Science',              category: 'defence', sort_order: 12 },

  // ─── INTEGRATED / DUAL DEGREE ───────────────────────────────────────────────
  { key_name: 'integrated_bsc_msc',      value: 'Integrated B.Sc. - M.Sc. (5-Year)',               category: 'integrated', sort_order: 10 },
  { key_name: 'integrated_btech_mtech',  value: 'Integrated B.Tech - M.Tech (Dual Degree, 5-Year)', category: 'integrated', sort_order: 11 },
  { key_name: 'integrated_ba_ma',        value: 'Integrated B.A. - M.A. (5-Year)',                  category: 'integrated', sort_order: 12 },
  { key_name: 'integrated_bcom_mcom',    value: 'Integrated B.Com. - M.Com. (5-Year)',              category: 'integrated', sort_order: 13 },
  { key_name: 'integrated_mba',          value: 'Integrated MBA (5-Year BBA + MBA)',                 category: 'integrated', sort_order: 14 },

  // ─── DOCTORAL ────────────────────────────────────────────────────────────────
  { key_name: 'phd_engg',       value: 'Ph.D. - Engineering & Technology',           category: 'doctoral', sort_order: 10 },
  { key_name: 'phd_medical',    value: 'Ph.D. - Medical Sciences',                   category: 'doctoral', sort_order: 11 },
  { key_name: 'phd_science',    value: 'Ph.D. - Science',                            category: 'doctoral', sort_order: 12 },
  { key_name: 'phd_commerce',   value: 'Ph.D. - Commerce & Management',              category: 'doctoral', sort_order: 13 },
  { key_name: 'phd_humanities', value: 'Ph.D. - Humanities & Social Sciences',       category: 'doctoral', sort_order: 14 },
  { key_name: 'phd_law',        value: 'Ph.D. - Law',                                category: 'doctoral', sort_order: 15 },
  { key_name: 'phd_edu',        value: 'Ph.D. - Education',                          category: 'doctoral', sort_order: 16 },
  { key_name: 'phd_agri',       value: 'Ph.D. - Agriculture',                        category: 'doctoral', sort_order: 17 },
  { key_name: 'phd_cs',         value: 'Ph.D. - Computer Science',                   category: 'doctoral', sort_order: 18 },

  // ─── DIPLOMA & CERTIFICATE (AFTER 12TH) ─────────────────────────────────────
  { key_name: 'dip_civil',       value: 'Diploma - Civil Engineering',             category: 'diploma', sort_order: 10 },
  { key_name: 'dip_mechanical',  value: 'Diploma - Mechanical Engineering',        category: 'diploma', sort_order: 11 },
  { key_name: 'dip_electrical',  value: 'Diploma - Electrical Engineering',        category: 'diploma', sort_order: 12 },
  { key_name: 'dip_computer',    value: 'Diploma - Computer Engineering',          category: 'diploma', sort_order: 13 },
  { key_name: 'dip_it',          value: 'Diploma - Information Technology',        category: 'diploma', sort_order: 14 },
  { key_name: 'dip_ec',          value: 'Diploma - Electronics & Communication',   category: 'diploma', sort_order: 15 },
  { key_name: 'dip_chemical',    value: 'Diploma - Chemical Engineering',          category: 'diploma', sort_order: 16 },
  { key_name: 'dip_textile',     value: 'Diploma - Textile Technology',            category: 'diploma', sort_order: 17 },
  { key_name: 'dip_auto',        value: 'Diploma - Automobile Engineering',        category: 'diploma', sort_order: 18 },
  { key_name: 'dpharm',          value: 'Diploma - Pharmacy (D.Pharm)',            category: 'diploma', sort_order: 19 },
  { key_name: 'dip_hotel',       value: 'Diploma - Hotel Management (3-Year)',     category: 'diploma', sort_order: 20 },
  { key_name: 'dip_nursing',     value: 'Diploma - Nursing',                       category: 'diploma', sort_order: 21 },

  // ─── OTHER ────────────────────────────────────────────────────────────────────
  { key_name: 'other', value: 'Other', category: 'other', sort_order: 999 },
];

// ─── MAIN SEED FUNCTION ────────────────────────────────────────────────────────

async function seed() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:     process.env.DB_PORT     || 3306,
  });

  console.log('✅  Connected to database:', process.env.DB_NAME);

  try {
    // ── School Standards ────────────────────────────────────────────────────
    console.log('\n📚  Seeding school_standards …');
    for (const s of schoolStandards) {
      await conn.execute(
        `INSERT INTO school_standards (key_name, value, category, sort_order)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE value = VALUES(value), category = VALUES(category), sort_order = VALUES(sort_order)`,
        [s.key_name, s.value, s.category, s.sort_order]
      );
    }
    console.log(`   → ${schoolStandards.length} records upserted`);

    // ── School Boards ───────────────────────────────────────────────────────
    console.log('\n🏫  Seeding school_boards …');
    for (const b of schoolBoards) {
      await conn.execute(
        `INSERT INTO school_boards (key_name, value)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE value = VALUES(value)`,
        [b.key_name, b.value]
      );
    }
    console.log(`   → ${schoolBoards.length} records upserted`);

    // ── College Degrees ─────────────────────────────────────────────────────
    console.log('\n🎓  Seeding college_degrees …');
    for (const d of collegeDegrees) {
      await conn.execute(
        `INSERT INTO college_degrees (key_name, value, sort_order)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE value = VALUES(value), sort_order = VALUES(sort_order)`,
        [d.key_name, d.value, d.sort_order]
      );
    }
    console.log(`   → ${collegeDegrees.length} records upserted`);

    console.log('\n🎉  Seeding complete!\n');
  } catch (err) {
    console.error('❌  Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

seed();
