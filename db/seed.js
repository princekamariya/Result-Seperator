// Run once to populate lookup tables: node db/seed.js

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { Client } = require('pg');
const bcrypt = require('bcrypt');

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
  { key_name: '11-science',  value: '11th Science',  category: 'higher_secondary', sort_order: 40 },
  { key_name: '11-commerce', value: '11th Commerce', category: 'higher_secondary', sort_order: 41 },
  { key_name: '11-arts',     value: '11th Arts',     category: 'higher_secondary', sort_order: 42 },
  { key_name: '12-science',  value: '12th Science',  category: 'higher_secondary', sort_order: 43 },
  { key_name: '12-commerce', value: '12th Commerce', category: 'higher_secondary', sort_order: 44 },
  { key_name: '12-arts',     value: '12th Arts',     category: 'higher_secondary', sort_order: 45 },
];

const schoolBoards = [
  { key_name: 'GSEB', value: 'GSEB (Gujarat Secondary and Higher Secondary Education Board)' },
  { key_name: 'CBSE', value: 'CBSE (Central Board of Secondary Education)'                  },
  { key_name: 'ICSE', value: 'ICSE (Indian Certificate of Secondary Education)'             },
];

const collegeDegrees = [
  // ENGINEERING
  { key_name: 'be_computer_engineering',  value: 'B.E. / B.Tech - Computer Engineering',                      sort_order: 10  },
  { key_name: 'be_cse',                   value: 'B.E. / B.Tech - Computer Science & Engineering',             sort_order: 11  },
  { key_name: 'be_it',                    value: 'B.E. / B.Tech - Information Technology',                     sort_order: 12  },
  { key_name: 'be_aiml',                  value: 'B.E. / B.Tech - Artificial Intelligence & Machine Learning', sort_order: 13  },
  { key_name: 'be_data_science',          value: 'B.E. / B.Tech - Data Science',                              sort_order: 14  },
  { key_name: 'be_cyber_security',        value: 'B.E. / B.Tech - Cyber Security',                            sort_order: 15  },
  { key_name: 'be_ece',                   value: 'B.E. / B.Tech - Electronics & Communication Engineering',    sort_order: 16  },
  { key_name: 'be_electrical',            value: 'B.E. / B.Tech - Electrical Engineering',                    sort_order: 17  },
  { key_name: 'be_eee',                   value: 'B.E. / B.Tech - Electrical & Electronics Engineering',      sort_order: 18  },
  { key_name: 'be_mechanical',            value: 'B.E. / B.Tech - Mechanical Engineering',                    sort_order: 19  },
  { key_name: 'be_automobile',            value: 'B.E. / B.Tech - Automobile Engineering',                    sort_order: 20  },
  { key_name: 'be_aerospace',             value: 'B.E. / B.Tech - Aerospace Engineering',                     sort_order: 21  },
  { key_name: 'be_aeronautical',          value: 'B.E. / B.Tech - Aeronautical Engineering',                  sort_order: 22  },
  { key_name: 'be_civil',                 value: 'B.E. / B.Tech - Civil Engineering',                         sort_order: 23  },
  { key_name: 'be_structural',            value: 'B.E. / B.Tech - Structural Engineering',                    sort_order: 24  },
  { key_name: 'be_environmental',         value: 'B.E. / B.Tech - Environmental Engineering',                 sort_order: 25  },
  { key_name: 'be_chemical',              value: 'B.E. / B.Tech - Chemical Engineering',                      sort_order: 26  },
  { key_name: 'be_petroleum',             value: 'B.E. / B.Tech - Petroleum Engineering',                     sort_order: 27  },
  { key_name: 'be_biotech',               value: 'B.E. / B.Tech - Biotechnology Engineering',                 sort_order: 28  },
  { key_name: 'be_biomedical',            value: 'B.E. / B.Tech - Biomedical Engineering',                    sort_order: 29  },
  { key_name: 'be_agricultural',          value: 'B.E. / B.Tech - Agricultural Engineering',                  sort_order: 30  },
  { key_name: 'be_mining',                value: 'B.E. / B.Tech - Mining Engineering',                        sort_order: 31  },
  { key_name: 'be_metallurgical',         value: 'B.E. / B.Tech - Metallurgical Engineering',                 sort_order: 32  },
  { key_name: 'be_industrial',            value: 'B.E. / B.Tech - Industrial Engineering',                    sort_order: 33  },
  { key_name: 'be_production',            value: 'B.E. / B.Tech - Production Engineering',                    sort_order: 34  },
  { key_name: 'be_textile',               value: 'B.E. / B.Tech - Textile Engineering',                       sort_order: 35  },
  { key_name: 'be_instrumentation',       value: 'B.E. / B.Tech - Instrumentation Engineering',               sort_order: 36  },
  { key_name: 'be_robotics',              value: 'B.E. / B.Tech - Robotics & Automation',                     sort_order: 37  },
  { key_name: 'be_marine',                value: 'B.E. / B.Tech - Marine Engineering',                        sort_order: 38  },
  { key_name: 'be_naval',                 value: 'B.E. / B.Tech - Naval Architecture',                        sort_order: 39  },
  { key_name: 'me_cse',                   value: 'M.E. / M.Tech - Computer Science & Engineering',             sort_order: 50  },
  { key_name: 'me_ai',                    value: 'M.E. / M.Tech - Artificial Intelligence',                   sort_order: 51  },
  { key_name: 'me_data_science',          value: 'M.E. / M.Tech - Data Science & Engineering',                sort_order: 52  },
  { key_name: 'me_vlsi',                  value: 'M.E. / M.Tech - VLSI Design',                               sort_order: 53  },
  { key_name: 'me_embedded',              value: 'M.E. / M.Tech - Embedded Systems',                          sort_order: 54  },
  { key_name: 'me_mechanical',            value: 'M.E. / M.Tech - Mechanical Engineering',                    sort_order: 55  },
  { key_name: 'me_structural',            value: 'M.E. / M.Tech - Structural Engineering',                    sort_order: 56  },
  { key_name: 'me_environmental',         value: 'M.E. / M.Tech - Environmental Engineering',                 sort_order: 57  },
  { key_name: 'me_thermal',               value: 'M.E. / M.Tech - Thermal Engineering',                       sort_order: 58  },
  { key_name: 'me_power_systems',         value: 'M.E. / M.Tech - Power Systems',                             sort_order: 59  },
  { key_name: 'me_biotech',               value: 'M.E. / M.Tech - Biotechnology',                             sort_order: 60  },
  { key_name: 'me_chemical',              value: 'M.E. / M.Tech - Chemical Engineering',                      sort_order: 61  },
  // MEDICINE
  { key_name: 'mbbs',            value: 'MBBS - Bachelor of Medicine & Bachelor of Surgery',          sort_order: 100 },
  { key_name: 'bds',             value: 'BDS - Bachelor of Dental Surgery',                           sort_order: 101 },
  { key_name: 'bams',            value: 'BAMS - Bachelor of Ayurvedic Medicine & Surgery',            sort_order: 102 },
  { key_name: 'bhms',            value: 'BHMS - Bachelor of Homeopathic Medicine & Surgery',          sort_order: 103 },
  { key_name: 'bums',            value: 'BUMS - Bachelor of Unani Medicine & Surgery',                sort_order: 104 },
  { key_name: 'bnys',            value: 'BNYS - Bachelor of Naturopathy & Yogic Sciences',            sort_order: 105 },
  { key_name: 'bpharm',          value: 'B.Pharm - Bachelor of Pharmacy',                             sort_order: 106 },
  { key_name: 'pharmd',          value: 'Pharm.D - Doctor of Pharmacy',                               sort_order: 107 },
  { key_name: 'bpt',             value: 'BPT - Bachelor of Physiotherapy',                            sort_order: 108 },
  { key_name: 'bot',             value: 'BOT - Bachelor of Occupational Therapy',                     sort_order: 109 },
  { key_name: 'bsc_nursing',     value: 'B.Sc. Nursing',                                              sort_order: 110 },
  { key_name: 'gnm',             value: 'GNM - General Nursing & Midwifery',                          sort_order: 111 },
  { key_name: 'anm',             value: 'ANM - Auxiliary Nursing & Midwifery',                        sort_order: 112 },
  { key_name: 'bmlt',            value: 'BMLT - Bachelor of Medical Lab Technology',                  sort_order: 113 },
  { key_name: 'bsc_mit',         value: 'B.Sc. Medical Imaging Technology',                           sort_order: 114 },
  { key_name: 'bsc_radiology',   value: 'B.Sc. Radiology & Imaging Technology',                      sort_order: 115 },
  { key_name: 'bsc_ott',         value: 'B.Sc. Operation Theatre Technology',                         sort_order: 116 },
  { key_name: 'bsc_optometry',   value: 'B.Sc. Optometry',                                           sort_order: 117 },
  { key_name: 'bsc_audiology',   value: 'B.Sc. Audiology & Speech-Language Pathology',               sort_order: 118 },
  { key_name: 'bvsc',            value: 'BVSc & AH - Bachelor of Veterinary Science',                 sort_order: 119 },
  { key_name: 'md',              value: 'MD - Doctor of Medicine',                                    sort_order: 120 },
  { key_name: 'ms_surgery',      value: 'MS - Master of Surgery',                                     sort_order: 121 },
  { key_name: 'mds',             value: 'MDS - Master of Dental Surgery',                             sort_order: 122 },
  { key_name: 'mpharm',          value: 'M.Pharm - Master of Pharmacy',                               sort_order: 123 },
  { key_name: 'mpt',             value: 'MPT - Master of Physiotherapy',                              sort_order: 124 },
  { key_name: 'msc_nursing',     value: 'M.Sc. Nursing',                                              sort_order: 125 },
  { key_name: 'dm',              value: 'DM - Doctorate of Medicine (Super Specialty)',                sort_order: 126 },
  { key_name: 'mch',             value: 'MCh - Master of Chirurgiae (Super Specialty Surgery)',       sort_order: 127 },
  // LAW
  { key_name: 'llb_3',              value: 'LL.B. - Bachelor of Laws (3-Year)',                       sort_order: 200 },
  { key_name: 'ba_llb',             value: 'B.A. LL.B. - Law with Arts (5-Year Integrated)',          sort_order: 201 },
  { key_name: 'bcom_llb',           value: 'B.Com. LL.B. - Law with Commerce (5-Year Integrated)',    sort_order: 202 },
  { key_name: 'bsc_llb',            value: 'B.Sc. LL.B. - Law with Science (5-Year Integrated)',      sort_order: 203 },
  { key_name: 'bba_llb',            value: 'BBA LL.B. - Law with Business Administration (5-Year)',   sort_order: 204 },
  { key_name: 'btech_llb',          value: 'B.Tech LL.B. - Law with Technology (5-Year)',             sort_order: 205 },
  { key_name: 'llm',                value: 'LL.M. - Master of Laws',                                  sort_order: 206 },
  { key_name: 'llm_corporate',      value: 'LL.M. - Corporate & Commercial Law',                      sort_order: 207 },
  { key_name: 'llm_criminal',       value: 'LL.M. - Criminal Law',                                   sort_order: 208 },
  { key_name: 'llm_constitutional', value: 'LL.M. - Constitutional Law',                              sort_order: 209 },
  { key_name: 'llm_international',  value: 'LL.M. - International Law',                               sort_order: 210 },
  { key_name: 'llm_ip',             value: 'LL.M. - Intellectual Property Law',                       sort_order: 211 },
  { key_name: 'llm_cyber',          value: 'LL.M. - Cyber Law',                                       sort_order: 212 },
  { key_name: 'llm_human_rights',   value: 'LL.M. - Human Rights Law',                                sort_order: 213 },
  { key_name: 'lld',                value: 'LL.D. - Doctor of Laws',                                  sort_order: 214 },
  // MANAGEMENT
  { key_name: 'bba',              value: 'BBA - Bachelor of Business Administration',   sort_order: 300 },
  { key_name: 'bba_finance',      value: 'BBA - Finance',                               sort_order: 301 },
  { key_name: 'bba_marketing',    value: 'BBA - Marketing',                             sort_order: 302 },
  { key_name: 'bba_hr',           value: 'BBA - Human Resource Management',             sort_order: 303 },
  { key_name: 'bba_ib',           value: 'BBA - International Business',                sort_order: 304 },
  { key_name: 'bba_logistics',    value: 'BBA - Logistics & Supply Chain',              sort_order: 305 },
  { key_name: 'bms',              value: 'BMS - Bachelor of Management Studies',        sort_order: 306 },
  { key_name: 'bcom_general',     value: 'B.Com. - General',                            sort_order: 307 },
  { key_name: 'bcom_af',          value: 'B.Com. - Accounting & Finance',               sort_order: 308 },
  { key_name: 'bcom_bi',          value: 'B.Com. - Banking & Insurance',                sort_order: 309 },
  { key_name: 'bcom_fm',          value: 'B.Com. - Financial Markets',                  sort_order: 310 },
  { key_name: 'bcom_taxation',    value: 'B.Com. - Taxation',                           sort_order: 311 },
  { key_name: 'bcom_ca',          value: 'B.Com. - Computer Applications',              sort_order: 312 },
  { key_name: 'mba_general',      value: 'MBA - General Management',                   sort_order: 313 },
  { key_name: 'mba_finance',      value: 'MBA - Finance',                               sort_order: 314 },
  { key_name: 'mba_marketing',    value: 'MBA - Marketing',                             sort_order: 315 },
  { key_name: 'mba_hr',           value: 'MBA - Human Resource Management',             sort_order: 316 },
  { key_name: 'mba_operations',   value: 'MBA - Operations Management',                 sort_order: 317 },
  { key_name: 'mba_it',           value: 'MBA - Information Technology',                sort_order: 318 },
  { key_name: 'mba_ib',           value: 'MBA - International Business',                sort_order: 319 },
  { key_name: 'mba_scm',          value: 'MBA - Supply Chain & Logistics',              sort_order: 320 },
  { key_name: 'mba_healthcare',   value: 'MBA - Healthcare Management',                 sort_order: 321 },
  { key_name: 'mba_rural',        value: 'MBA - Rural Management',                      sort_order: 322 },
  { key_name: 'mba_agri',         value: 'MBA - Agri Business',                         sort_order: 323 },
  { key_name: 'mba_analytics',    value: 'MBA - Business Analytics',                    sort_order: 324 },
  { key_name: 'mba_entrepreneurship', value: 'MBA - Entrepreneurship',                  sort_order: 325 },
  { key_name: 'pgdm',             value: 'PGDM - Post Graduate Diploma in Management',  sort_order: 326 },
  { key_name: 'mcom_general',     value: 'M.Com. - General',                            sort_order: 327 },
  { key_name: 'mcom_finance',     value: 'M.Com. - Finance & Taxation',                 sort_order: 328 },
  { key_name: 'mcom_accounting',  value: 'M.Com. - Accounting',                         sort_order: 329 },
  // COMPUTER SCIENCE
  { key_name: 'bca',          value: 'BCA - Bachelor of Computer Applications',            sort_order: 400 },
  { key_name: 'bca_cloud',    value: 'BCA - Cloud Computing',                              sort_order: 401 },
  { key_name: 'bca_ds',       value: 'BCA - Data Science',                                 sort_order: 402 },
  { key_name: 'bsc_cs',       value: 'B.Sc. - Computer Science',                           sort_order: 403 },
  { key_name: 'bsc_it',       value: 'B.Sc. - Information Technology',                     sort_order: 404 },
  { key_name: 'bsc_ds',       value: 'B.Sc. - Data Science',                               sort_order: 405 },
  { key_name: 'bsc_ai',       value: 'B.Sc. - Artificial Intelligence',                    sort_order: 406 },
  { key_name: 'bsc_cyber',    value: 'B.Sc. - Cyber Security',                             sort_order: 407 },
  { key_name: 'bsc_software', value: 'B.Sc. - Software Development',                       sort_order: 408 },
  { key_name: 'mca',          value: 'MCA - Master of Computer Applications',              sort_order: 409 },
  { key_name: 'msc_cs',       value: 'M.Sc. - Computer Science',                           sort_order: 410 },
  { key_name: 'msc_it',       value: 'M.Sc. - Information Technology',                     sort_order: 411 },
  { key_name: 'msc_ds',       value: 'M.Sc. - Data Science',                               sort_order: 412 },
  { key_name: 'msc_aiml',     value: 'M.Sc. - Artificial Intelligence & Machine Learning', sort_order: 413 },
  { key_name: 'msc_cyber',    value: 'M.Sc. - Cyber Security',                             sort_order: 414 },
  // SCIENCE
  { key_name: 'bsc_physics',    value: 'B.Sc. - Physics',               sort_order: 500 },
  { key_name: 'bsc_chemistry',  value: 'B.Sc. - Chemistry',             sort_order: 501 },
  { key_name: 'bsc_maths',      value: 'B.Sc. - Mathematics',           sort_order: 502 },
  { key_name: 'bsc_stats',      value: 'B.Sc. - Statistics',            sort_order: 503 },
  { key_name: 'bsc_biology',    value: 'B.Sc. - Biology',               sort_order: 504 },
  { key_name: 'bsc_micro',      value: 'B.Sc. - Microbiology',          sort_order: 505 },
  { key_name: 'bsc_biochem',    value: 'B.Sc. - Biochemistry',          sort_order: 506 },
  { key_name: 'bsc_biotech',    value: 'B.Sc. - Biotechnology',         sort_order: 507 },
  { key_name: 'bsc_genetics',   value: 'B.Sc. - Genetics',              sort_order: 508 },
  { key_name: 'bsc_zoology',    value: 'B.Sc. - Zoology',               sort_order: 509 },
  { key_name: 'bsc_botany',     value: 'B.Sc. - Botany',                sort_order: 510 },
  { key_name: 'bsc_env',        value: 'B.Sc. - Environmental Science', sort_order: 511 },
  { key_name: 'bsc_agri',       value: 'B.Sc. - Agriculture',           sort_order: 512 },
  { key_name: 'bsc_hort',       value: 'B.Sc. - Horticulture',          sort_order: 513 },
  { key_name: 'bsc_forensic',   value: 'B.Sc. - Forensic Science',      sort_order: 514 },
  { key_name: 'bsc_food',       value: 'B.Sc. - Food Science & Technology', sort_order: 515 },
  { key_name: 'bsc_nautical',   value: 'B.Sc. - Nautical Science',      sort_order: 516 },
  { key_name: 'bsc_home',       value: 'B.Sc. - Home Science',          sort_order: 517 },
  { key_name: 'msc_physics',    value: 'M.Sc. - Physics',               sort_order: 520 },
  { key_name: 'msc_chemistry',  value: 'M.Sc. - Chemistry',             sort_order: 521 },
  { key_name: 'msc_maths',      value: 'M.Sc. - Mathematics',           sort_order: 522 },
  { key_name: 'msc_stats',      value: 'M.Sc. - Statistics',            sort_order: 523 },
  { key_name: 'msc_biotech',    value: 'M.Sc. - Biotechnology',         sort_order: 524 },
  { key_name: 'msc_micro',      value: 'M.Sc. - Microbiology',          sort_order: 525 },
  { key_name: 'msc_env',        value: 'M.Sc. - Environmental Science', sort_order: 526 },
  { key_name: 'msc_forensic',   value: 'M.Sc. - Forensic Science',      sort_order: 527 },
  { key_name: 'msc_agri',       value: 'M.Sc. - Agriculture',           sort_order: 528 },
  // ARTS
  { key_name: 'ba_english',    value: 'B.A. - English Literature',              sort_order: 600 },
  { key_name: 'ba_hindi',      value: 'B.A. - Hindi Literature',                sort_order: 601 },
  { key_name: 'ba_gujarati',   value: 'B.A. - Gujarati Literature',             sort_order: 602 },
  { key_name: 'ba_sanskrit',   value: 'B.A. - Sanskrit',                        sort_order: 603 },
  { key_name: 'ba_history',    value: 'B.A. - History',                         sort_order: 604 },
  { key_name: 'ba_geography',  value: 'B.A. - Geography',                       sort_order: 605 },
  { key_name: 'ba_polsci',     value: 'B.A. - Political Science',               sort_order: 606 },
  { key_name: 'ba_economics',  value: 'B.A. - Economics',                       sort_order: 607 },
  { key_name: 'ba_sociology',  value: 'B.A. - Sociology',                       sort_order: 608 },
  { key_name: 'ba_psychology', value: 'B.A. - Psychology',                      sort_order: 609 },
  { key_name: 'ba_philosophy', value: 'B.A. - Philosophy',                      sort_order: 610 },
  { key_name: 'ba_pub_admin',  value: 'B.A. - Public Administration',           sort_order: 611 },
  { key_name: 'ba_social_work', value: 'B.A. - Social Work',                    sort_order: 612 },
  { key_name: 'ba_journalism', value: 'B.A. - Journalism & Mass Communication', sort_order: 613 },
  { key_name: 'ba_rural',      value: 'B.A. - Rural Development',               sort_order: 614 },
  { key_name: 'ma_english',    value: 'M.A. - English Literature',              sort_order: 620 },
  { key_name: 'ma_hindi',      value: 'M.A. - Hindi Literature',                sort_order: 621 },
  { key_name: 'ma_history',    value: 'M.A. - History',                         sort_order: 622 },
  { key_name: 'ma_geography',  value: 'M.A. - Geography',                       sort_order: 623 },
  { key_name: 'ma_polsci',     value: 'M.A. - Political Science',               sort_order: 624 },
  { key_name: 'ma_economics',  value: 'M.A. - Economics',                       sort_order: 625 },
  { key_name: 'ma_sociology',  value: 'M.A. - Sociology',                       sort_order: 626 },
  { key_name: 'ma_psychology', value: 'M.A. - Psychology',                      sort_order: 627 },
  { key_name: 'ma_pub_admin',  value: 'M.A. - Public Administration',           sort_order: 628 },
  { key_name: 'ma_journalism', value: 'M.A. - Journalism & Mass Communication', sort_order: 629 },
  { key_name: 'msw',           value: 'M.A. - Social Work (MSW)',               sort_order: 630 },
  // EDUCATION
  { key_name: 'bed',         value: 'B.Ed. - Bachelor of Education',              sort_order: 700 },
  { key_name: 'bed_special', value: 'B.Ed. - Special Education',                  sort_order: 701 },
  { key_name: 'med',         value: 'M.Ed. - Master of Education',                sort_order: 702 },
  { key_name: 'bped',        value: 'B.P.Ed. - Bachelor of Physical Education',   sort_order: 703 },
  { key_name: 'mped',        value: 'M.P.Ed. - Master of Physical Education',     sort_order: 704 },
  { key_name: 'deled',       value: 'D.El.Ed. - Diploma in Elementary Education', sort_order: 705 },
  { key_name: 'beled',       value: 'B.El.Ed. - Bachelor of Elementary Education', sort_order: 706 },
  { key_name: 'ntt',         value: 'NTT - Nursery Teacher Training',             sort_order: 707 },
  // ARCHITECTURE AND DESIGN
  { key_name: 'barch',           value: 'B.Arch. - Bachelor of Architecture',                  sort_order: 800 },
  { key_name: 'march',           value: 'M.Arch. - Master of Architecture',                    sort_order: 801 },
  { key_name: 'bdes_graphic',    value: 'B.Des. - Graphic Design',                             sort_order: 802 },
  { key_name: 'bdes_interior',   value: 'B.Des. - Interior Design',                            sort_order: 803 },
  { key_name: 'bdes_fashion',    value: 'B.Des. - Fashion Design',                             sort_order: 804 },
  { key_name: 'bdes_product',    value: 'B.Des. - Product Design',                             sort_order: 805 },
  { key_name: 'bdes_animation',  value: 'B.Des. - Animation & Multimedia',                     sort_order: 806 },
  { key_name: 'bdes_ux',         value: 'B.Des. - UI/UX Design',                              sort_order: 807 },
  { key_name: 'bdes_textile',    value: 'B.Des. - Textile Design',                             sort_order: 808 },
  { key_name: 'mdes',            value: 'M.Des. - Master of Design',                           sort_order: 809 },
  { key_name: 'bfa',             value: 'B.F.A. - Bachelor of Fine Arts',                      sort_order: 810 },
  { key_name: 'mfa',             value: 'M.F.A. - Master of Fine Arts',                        sort_order: 811 },
  { key_name: 'bplan',           value: 'B.Plan. - Bachelor of Planning (Urban & Regional)',   sort_order: 812 },
  // AGRICULTURE
  { key_name: 'bsc_agri_4yr',     value: 'B.Sc. Agriculture (4-Year)',        sort_order: 900 },
  { key_name: 'bsc_horticulture', value: 'B.Sc. Horticulture',                sort_order: 901 },
  { key_name: 'bsc_forestry',     value: 'B.Sc. Forestry',                    sort_order: 902 },
  { key_name: 'bsc_fisheries',    value: 'B.Sc. Fisheries Science',           sort_order: 903 },
  { key_name: 'bsc_sericulture',  value: 'B.Sc. Sericulture',                 sort_order: 904 },
  { key_name: 'bsc_foodtech',     value: 'B.Sc. Food Technology',             sort_order: 905 },
  { key_name: 'bsc_dairy',        value: 'B.Sc. Dairy Technology',            sort_order: 906 },
  { key_name: 'btech_agri_engg',  value: 'B.Tech - Agricultural Engineering', sort_order: 907 },
  { key_name: 'btech_food',       value: 'B.Tech - Food Technology',          sort_order: 908 },
  { key_name: 'msc_agri_pg',      value: 'M.Sc. Agriculture',                 sort_order: 909 },
  { key_name: 'msc_horticulture', value: 'M.Sc. Horticulture',                sort_order: 910 },
  { key_name: 'mba_agribiz',      value: 'MBA - Agribusiness Management',     sort_order: 911 },
  // PROFESSIONAL
  { key_name: 'ca',    value: 'CA - Chartered Accountancy (ICAI)',                      sort_order: 1000 },
  { key_name: 'cma',   value: 'CMA - Cost & Management Accountancy (ICMAI)',            sort_order: 1001 },
  { key_name: 'cs',    value: 'CS - Company Secretary (ICSI)',                          sort_order: 1002 },
  { key_name: 'cfa',   value: 'CFA - Chartered Financial Analyst',                     sort_order: 1003 },
  { key_name: 'cfp',   value: 'CFP - Certified Financial Planner',                     sort_order: 1004 },
  { key_name: 'acca',  value: 'ACCA - Association of Chartered Certified Accountants',  sort_order: 1005 },
  { key_name: 'cia',   value: 'CIA - Certified Internal Auditor',                      sort_order: 1006 },
  // HOSPITALITY
  { key_name: 'bsc_hotel',       value: 'B.Sc. - Hotel Management & Catering Technology',    sort_order: 1100 },
  { key_name: 'bhm',             value: 'BHM - Bachelor of Hotel Management',                sort_order: 1101 },
  { key_name: 'bhmct',           value: 'BHMCT - Bachelor of Hotel Management & Catering',   sort_order: 1102 },
  { key_name: 'bsc_hospitality', value: 'B.Sc. - Hospitality & Tourism',                     sort_order: 1103 },
  { key_name: 'mhm',             value: 'MHM - Master of Hotel Management',                  sort_order: 1104 },
  { key_name: 'mba_hospitality', value: 'MBA - Hospitality & Tourism Management',            sort_order: 1105 },
  // MEDIA
  { key_name: 'bjmc',      value: 'BJMC - Bachelor of Journalism & Mass Communication', sort_order: 1200 },
  { key_name: 'bsc_media', value: 'B.Sc. - Mass Communication & Media Technology',     sort_order: 1201 },
  { key_name: 'bmm',       value: 'BMM - Bachelor of Mass Media',                       sort_order: 1202 },
  { key_name: 'mjmc',      value: 'MJMC - Master of Journalism & Mass Communication',   sort_order: 1203 },
  { key_name: 'ma_media',  value: 'M.A. - Media Studies',                               sort_order: 1204 },
  { key_name: 'pgd_pr',    value: 'PG Diploma - Advertising & Public Relations',         sort_order: 1205 },
  // SOCIAL SCIENCES
  { key_name: 'bsw',        value: 'BSW - Bachelor of Social Work',        sort_order: 1300 },
  { key_name: 'msw_pg',     value: 'MSW - Master of Social Work',          sort_order: 1301 },
  { key_name: 'mpp',        value: 'MPP - Master of Public Policy',        sort_order: 1302 },
  { key_name: 'mpa',        value: 'MPA - Master of Public Administration', sort_order: 1303 },
  { key_name: 'bsc_social', value: 'B.Sc. - Social Sciences',              sort_order: 1304 },
  // PERFORMING ARTS
  { key_name: 'ba_music_vocal', value: 'B.A. - Music (Vocal)',         sort_order: 1400 },
  { key_name: 'ba_music_inst',  value: 'B.A. - Music (Instrumental)', sort_order: 1401 },
  { key_name: 'ba_dance',       value: 'B.A. - Dance',                sort_order: 1402 },
  { key_name: 'ba_theatre',     value: 'B.A. - Theatre & Drama',      sort_order: 1403 },
  { key_name: 'ba_film',        value: 'B.A. - Film Studies',         sort_order: 1404 },
  { key_name: 'ma_music',       value: 'M.A. - Music',                sort_order: 1405 },
  { key_name: 'ma_dance',       value: 'M.A. - Dance',                sort_order: 1406 },
  { key_name: 'ma_theatre',     value: 'M.A. - Theatre Arts',         sort_order: 1407 },
  // LIBRARY SCIENCE
  { key_name: 'blib', value: 'B.Lib.I.Sc. - Bachelor of Library & Information Science', sort_order: 1500 },
  { key_name: 'mlib', value: 'M.Lib.I.Sc. - Master of Library & Information Science',   sort_order: 1501 },
  // DEFENCE
  { key_name: 'bsc_defence',  value: 'B.Sc. - Defence Studies',             sort_order: 1600 },
  { key_name: 'msc_defence',  value: 'M.Sc. - Defence & Strategic Studies', sort_order: 1601 },
  { key_name: 'bsc_maritime', value: 'B.Sc. - Maritime Science',            sort_order: 1602 },
  // INTEGRATED
  { key_name: 'integrated_bsc_msc',     value: 'Integrated B.Sc. - M.Sc. (5-Year)',               sort_order: 1700 },
  { key_name: 'integrated_btech_mtech', value: 'Integrated B.Tech - M.Tech (Dual Degree, 5-Year)', sort_order: 1701 },
  { key_name: 'integrated_ba_ma',       value: 'Integrated B.A. - M.A. (5-Year)',                  sort_order: 1702 },
  { key_name: 'integrated_bcom_mcom',   value: 'Integrated B.Com. - M.Com. (5-Year)',              sort_order: 1703 },
  { key_name: 'integrated_mba',         value: 'Integrated MBA (5-Year BBA + MBA)',                 sort_order: 1704 },
  // DOCTORAL
  { key_name: 'phd_engg',       value: 'Ph.D. - Engineering & Technology',      sort_order: 1800 },
  { key_name: 'phd_medical',    value: 'Ph.D. - Medical Sciences',              sort_order: 1801 },
  { key_name: 'phd_science',    value: 'Ph.D. - Science',                       sort_order: 1802 },
  { key_name: 'phd_commerce',   value: 'Ph.D. - Commerce & Management',         sort_order: 1803 },
  { key_name: 'phd_humanities', value: 'Ph.D. - Humanities & Social Sciences',  sort_order: 1804 },
  { key_name: 'phd_law',        value: 'Ph.D. - Law',                           sort_order: 1805 },
  { key_name: 'phd_edu',        value: 'Ph.D. - Education',                     sort_order: 1806 },
  { key_name: 'phd_agri',       value: 'Ph.D. - Agriculture',                   sort_order: 1807 },
  { key_name: 'phd_cs',         value: 'Ph.D. - Computer Science',              sort_order: 1808 },
  // DIPLOMA
  { key_name: 'dip_civil',      value: 'Diploma - Civil Engineering',           sort_order: 1900 },
  { key_name: 'dip_mechanical', value: 'Diploma - Mechanical Engineering',      sort_order: 1901 },
  { key_name: 'dip_electrical', value: 'Diploma - Electrical Engineering',      sort_order: 1902 },
  { key_name: 'dip_computer',   value: 'Diploma - Computer Engineering',        sort_order: 1903 },
  { key_name: 'dip_it',         value: 'Diploma - Information Technology',      sort_order: 1904 },
  { key_name: 'dip_ec',         value: 'Diploma - Electronics & Communication', sort_order: 1905 },
  { key_name: 'dip_chemical',   value: 'Diploma - Chemical Engineering',        sort_order: 1906 },
  { key_name: 'dip_textile',    value: 'Diploma - Textile Technology',          sort_order: 1907 },
  { key_name: 'dip_auto',       value: 'Diploma - Automobile Engineering',      sort_order: 1908 },
  { key_name: 'dpharm',         value: 'Diploma - Pharmacy (D.Pharm)',          sort_order: 1909 },
  { key_name: 'dip_hotel',      value: 'Diploma - Hotel Management (3-Year)',   sort_order: 1910 },
  { key_name: 'dip_nursing',    value: 'Diploma - Nursing',                     sort_order: 1911 },
  // OTHER
  { key_name: 'other', value: 'Other', sort_order: 9999 },
];

async function seed() {
  const client = new Client({
    host:     process.env.DB_HOST     || 'localhost',
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:     Number(process.env.DB_PORT) || 5432,
  });

  await client.connect();
  console.log('Connected to database ' + process.env.DB_NAME);

  try {
    console.log('Seeding school_standards');
    for (const s of schoolStandards) {
      await client.query(
        `INSERT INTO school_standards (key_name, value, category, sort_order)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (key_name) DO UPDATE
           SET value = EXCLUDED.value, category = EXCLUDED.category, sort_order = EXCLUDED.sort_order`,
        [s.key_name, s.value, s.category, s.sort_order]
      );
    }
    console.log(schoolStandards.length + ' school standards done');

    console.log('Seeding school_boards');
    for (const b of schoolBoards) {
      await client.query(
        `INSERT INTO school_boards (key_name, value)
         VALUES ($1, $2)
         ON CONFLICT (key_name) DO UPDATE
           SET value = EXCLUDED.value`,
        [b.key_name, b.value]
      );
    }
    console.log(schoolBoards.length + ' school boards done');

    console.log('Seeding college_degrees');
    for (const d of collegeDegrees) {
      await client.query(
        `INSERT INTO college_degrees (key_name, value, sort_order)
         VALUES ($1, $2, $3)
         ON CONFLICT (key_name) DO UPDATE
           SET value = EXCLUDED.value, sort_order = EXCLUDED.sort_order`,
        [d.key_name, d.value, d.sort_order]
      );
    }
    console.log(collegeDegrees.length + ' college degrees done');

    console.log('Seeding admin_users');
    const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@resultseparator.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const hashedPw      = await bcrypt.hash(adminPassword, Number(process.env.SALT_ROUNDS) || 10);
    await client.query(
      `INSERT INTO admin_users (email, password, is_active)
       VALUES ($1, $2, TRUE)
       ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password`,
      [adminEmail, hashedPw]
    );
    console.log('Admin user seeded — email: ' + adminEmail);

    console.log('Seeding complete');
  } catch (err) {
    console.error('Seeding failed: ' + err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();
