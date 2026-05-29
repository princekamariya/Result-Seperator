const Joi = require('joi');

// Reusable Indian mobile number rule
const phone = Joi.string()
  .pattern(/^[6-9]\d{9}$/)
  .messages({ 'string.pattern.base': 'Enter a valid 10-digit mobile number' });

const submissionSchema = Joi.object({

  // ── Personal ─────────────────────────────────────────────────────────────
  first_name:  Joi.string().trim().max(100).required().messages({ 'any.required': 'First name is required' }),
  middle_name: Joi.string().trim().max(100).empty('').optional(),
  last_name:   Joi.string().trim().max(100).required().messages({ 'any.required': 'Last name is required' }),
  mother_name: Joi.string().trim().max(100).required().messages({ 'any.required': "Mother's name is required" }),

  // ── Contact ──────────────────────────────────────────────────────────────
  parents_phone:       phone.required().messages({ 'any.required': "Parent's phone is required" }),
  whatsapp_number:     phone.required().messages({ 'any.required': 'WhatsApp number is required' }),
  email:               Joi.string().trim().email().empty('').optional().messages({ 'string.email': 'Enter a valid email address' }),
  student_phone:       phone.empty('').optional(),
  residential_address: Joi.string().trim().min(5).max(500).required().messages({
    'any.required': 'Residential address is required',
    'string.min':   'Address is too short',
  }),

  // ── Education Type ───────────────────────────────────────────────────────
  student_type: Joi.string().valid('school', 'college').required().messages({
    'any.required': 'Select school or college',
    'any.only':     'Invalid student type',
  }),

  // ── School fields (required only when student_type = 'school') ───────────
  school_standard_id: Joi.when('student_type', {
    is:        'school',
    then:      Joi.string().trim().required().messages({ 'any.required': 'Select your standard' }),
    otherwise: Joi.string().trim().empty('').optional(),
  }),
  school_board_id: Joi.when('student_type', {
    is:        'school',
    then:      Joi.string().trim().required().messages({ 'any.required': 'Select your board' }),
    otherwise: Joi.string().trim().empty('').optional(),
  }),

  // ── College fields (required only when student_type = 'college') ─────────
  college_degree_id: Joi.when('student_type', {
    is:        'college',
    then:      Joi.string().trim().required().messages({ 'any.required': 'Select your degree' }),
    otherwise: Joi.string().trim().empty('').optional(),
  }),
  semester: Joi.when('student_type', {
    is:        'college',
    then:      Joi.number().integer().min(1).max(10).required().messages({
                 'any.required': 'Select your semester',
                 'number.min':   'Semester must be between 1 and 10',
                 'number.max':   'Semester must be between 1 and 10',
               }),
    otherwise: Joi.number().integer().min(1).max(10).empty('').optional(),
  }),
  university_name: Joi.string().trim().max(250).empty('').optional(),

  // ── Result ───────────────────────────────────────────────────────────────
  result_year: Joi.number().integer().min(2000).max(2099).required().messages({
    'any.required': 'Result year is required',
    'number.min':   'Enter a valid result year',
    'number.max':   'Enter a valid result year',
    'number.base':  'Enter a valid result year',
  }),
  percentage: Joi.number().min(0).max(100).precision(2).required().messages({
    'any.required': 'Percentage is required',
    'number.min':   'Percentage must be between 0 and 100',
    'number.max':   'Percentage must be between 0 and 100',
    'number.base':  'Enter a valid percentage',
  }),
});

module.exports = { submissionSchema };
