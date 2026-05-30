const { submissionSchema }    = require('../validators/submission.validator');
const { insert, query }       = require('../utils/db');
const { uploadFile }          = require('../utils/cloudinary');

// POST /api/submissions
const createSubmission = async (req, res) => {
  try {
    // Validate body with Joi
    const { error, value } = submissionSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(422).json({
        success: false,
        errors:  error.details.map(d => d.message),
      });
    }

    // Duplicate check — same year + phones + name combination
    const dupParams = [
      value.result_year,
      value.parents_phone,
      value.whatsapp_number,
      value.first_name,
      value.last_name,
      value.middle_name || null,
    ];
    let dupSql = `
      SELECT id FROM student_submissions
      WHERE result_year = ?
        AND parents_phone = ?
        AND whatsapp_number = ?
        AND first_name = ?
        AND last_name = ?
        AND middle_name <=> ?
    `;
    if (value.email) {
      dupSql += ' AND email = ?';
      dupParams.push(value.email);
    }
    dupSql += ' LIMIT 1';

    const [existing] = await query(dupSql, dupParams);
    if (existing) {
      return res.status(409).json({
        success: false,
        errors: ['A submission with the same details already exists for this result year.'],
      });
    }

    // File is required — checked separately since multer handles it outside Joi
    if (!req.file) {
      return res.status(422).json({ success: false, errors: ['Result marksheet is required'] });
    }

    // Upload marksheet to Cloudinary
    const { url, publicId } = await uploadFile(req.file.buffer);

    const isSchool  = value.student_type === 'school';
    const isCollege = value.student_type === 'college';

    const id = await insert('student_submissions', {
      first_name:          value.first_name,
      middle_name:         value.middle_name         ?? null,
      last_name:           value.last_name,
      mother_name:         value.mother_name,
      parents_phone:       value.parents_phone,
      whatsapp_number:     value.whatsapp_number,
      email:               value.email               ?? null,
      student_phone:       value.student_phone       ?? null,
      residential_address: value.residential_address,
      student_type:        value.student_type,

      // School-specific
      school_standard_id:  isSchool  ? value.school_standard_id : null,
      school_board_id:     isSchool  ? value.school_board_id    : null,

      // College-specific
      college_degree_id:   isCollege ? value.college_degree_id  : null,
      semester:            isCollege ? value.semester            : null,
      university_name:     isCollege ? (value.university_name ?? null) : null,

      result_year:           value.result_year,
      percentage:            value.percentage,
      result_image_url:      url,
      result_image_public_id: publicId,
    });

    res.status(201).json({
      success:       true,
      message:       'Result submitted successfully! The community will review it shortly.',
      submission_id: id,
    });
  } catch (err) {
    console.error('createSubmission:', err);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

module.exports = { createSubmission };
