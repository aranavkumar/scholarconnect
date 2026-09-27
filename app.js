/* ============================================
   ScholarConnect — Application Logic
   ============================================ */

const ScholarConnect = (() => {
  'use strict';

  // ─── State ────────────────────────────────────
  const state = {
    currentScreen: 1,
    phone: '',
    otpSent: false,
    otpVerified: false,
    currentOtp: '',
    otpExpiresAt: null,
    otpTimerInterval: null,
    digilockerData: null,
    uploadedDocs: {},
    selectedIdType: 'aadhaar',
    selectedScholarship: null,
    scholarships: [],
    profile: {},
  };

  // ─── Mock DigiLocker Data ─────────────────────
  const MOCK_DIGILOCKER_DATA = {
    fullName: 'Raj Sharma ',
    fatherName: 'Ramesh Sharma',
    motherName: 'Rekha Sharma',
    personalMobile: '',
    fatherMobile: '9876543210',
    motherMobile: '9876543211',
    dob: '18-10-2008',
    gender: 'male',
    currentAddress: '42, Sector 15, Vasundhara, Ghaziabad, Uttar Pradesh - 201012',
    permanentAddress: '42, Sector 15, Vasundhara, Ghaziabad, Uttar Pradesh - 201012',
    state: 'Uttar Pradesh',
    category: 'General',
    educationLevel: '12th',
    percentage: 89.2,
    familyIncome: 320000,
  };

  // ─── Mock Scholarship Database ────────────────
  const SCHOLARSHIP_DB = [
    {
      id: 'nms-2026',
      name: 'National Merit Scholarship',
      issuer: 'Government of India — Ministry of Education',
      benefit: '₹50,000 per year',
      benefitAmount: 50000,
      deadline: '30 October 2026',
      objective: 'To provide financial assistance to meritorious students from economically weaker sections to pursue higher education. The scheme aims to reduce dropout rates and encourage academic excellence across the nation.',
      eligibility: [
        'Indian citizen',
        'Age between 17–25 years',
        'Passed 12th or equivalent with 75% or above',
        'Family annual income below ₹8,00,000',
        'Currently enrolled in a recognized institution',
      ],
      benefitsText: 'Annual scholarship of ₹50,000 for up to 4 years of undergraduate study. Additional ₹10,000 book allowance per year. One-time laptop grant of ₹25,000 for first-year students.',
      docsRequired: ['10th Marksheet', '12th Marksheet', 'Identity Proof (Aadhaar/Passport)', 'Income Certificate', 'Bank Account Details'],
      guidelines: 'Applications must be submitted online through the National Scholarship Portal. Students must maintain a minimum 60% attendance and 65% marks in each semester to continue receiving the scholarship. The scholarship is non-transferable and will be credited directly to the student\'s bank account.',
      faqs: [
        { q: 'Can I apply if I\'m in a private college?', a: 'Yes, students in both government and recognized private institutions are eligible.' },
        { q: 'Is there a renewal process?', a: 'Yes, students must apply for renewal each year with updated academic records and maintain a minimum of 65% marks.' },
        { q: 'When will the amount be credited?', a: 'The scholarship amount is typically disbursed within 60 days of application approval, directly to the student\'s linked bank account.' },
      ],
      matchCriteria: (p) => p.percentage >= 75 && p.familyIncome <= 800000 && ['12th', 'UG', 'PG'].includes(p.educationLevel),
    },
    {
      id: 'pms-sc-2026',
      name: 'Post Matric Scholarship for SC Students',
      issuer: 'Ministry of Social Justice & Empowerment',
      benefit: '₹35,000 per year',
      benefitAmount: 35000,
      deadline: '15 November 2026',
      objective: 'To support Scheduled Caste students in pursuing post-matriculation education by covering tuition fees, maintenance allowance, and other educational expenses.',
      eligibility: [
        'Belongs to Scheduled Caste (SC) category',
        'Passed 10th class or higher',
        'Family annual income below ₹2,50,000',
        'Enrolled in a recognized post-matric course',
        'Not receiving any other scholarship',
      ],
      benefitsText: 'Full tuition fee waiver (up to ₹35,000 per year). Monthly maintenance allowance of ₹1,200 for hostellers and ₹550 for day scholars. Additional study tour charges and thesis/dissertation typing charges.',
      docsRequired: ['10th Marksheet', '12th Marksheet', 'Caste Certificate', 'Income Certificate', 'Identity Proof'],
      guidelines: 'Applications are processed through the state-level scholarship portals. Preference is given to students whose parents have not availed similar benefits. The student must not have a gap of more than 2 years in education.',
      faqs: [
        { q: 'Is this available for professional courses?', a: 'Yes, engineering, medical, and other professional courses are covered under this scheme.' },
        { q: 'Can students from all states apply?', a: 'Yes, this is a central scheme available in all states and union territories of India.' },
      ],
      matchCriteria: (p) => p.category === 'SC' && p.familyIncome <= 250000,
    },
    {
      id: 'pms-obc-2026',
      name: 'Post Matric Scholarship for OBC Students',
      issuer: 'Ministry of Social Justice & Empowerment',
      benefit: '₹25,000 per year',
      benefitAmount: 25000,
      deadline: '31 December 2026',
      objective: 'To enable OBC students to complete their post-matriculation education by providing financial support for fees, living expenses, and academic materials.',
      eligibility: [
        'Belongs to Other Backward Class (OBC) category',
        'Passed 10th class or higher',
        'Family annual income below ₹3,00,000',
        'Not in the creamy layer',
        'Enrolled in a recognized post-matric course',
      ],
      benefitsText: 'Scholarship up to ₹25,000 per year covering tuition and examination fees. Maintenance allowance of ₹1,000 per month for hostellers. Book and stationery allowance of ₹5,000 annually.',
      docsRequired: ['10th Marksheet', '12th Marksheet', 'OBC Certificate', 'Non-Creamy Layer Certificate', 'Income Certificate', 'Identity Proof'],
      guidelines: 'Students must apply within 60 days of admission. The scholarship is renewable annually subject to academic progress. Only two children per family are eligible for this scholarship.',
      faqs: [
        { q: 'What if my family income exceeds the limit?', a: 'Students with family income above ₹3,00,000 are not eligible. However, you may check other central schemes.' },
        { q: 'Can I get this along with a state scholarship?', a: 'No, students cannot avail two government scholarships simultaneously. You must choose one.' },
      ],
      matchCriteria: (p) => p.category === 'OBC' && p.familyIncome <= 300000,
    },
    {
      id: 'pm-yasasvi-2026',
      name: 'PM YASASVI Scholarship',
      issuer: 'Ministry of Social Justice & Empowerment',
      benefit: '₹75,000 per year',
      benefitAmount: 75000,
      deadline: '30 September 2026',
      objective: 'PM Young Achievers Scholarship Award Scheme for Vibrant India (PM-YASASVI) aims to provide quality education to students from OBC, EBC, and DNT categories through top-notch institutions.',
      eligibility: [
        'Belongs to OBC / EBC / DNT category',
        'Passed 10th or 12th with minimum 60%',
        'Family annual income below ₹5,00,000',
        'Age between 18–25 years',
        'Admitted to a top NIRF-ranked institution',
      ],
      benefitsText: 'Annual scholarship of ₹75,000 for undergraduate and ₹1,25,000 for postgraduate studies. Covers tuition fee, hostel charges, and study material costs. Performance bonus of ₹10,000 for top-performing scholars.',
      docsRequired: ['10th Marksheet', '12th Marksheet', 'Caste/Category Certificate', 'Income Certificate', 'Admission Letter', 'Identity Proof'],
      guidelines: 'Selection is based on a national-level entrance test (YASASVI Entrance Test). Shortlisted candidates will be notified via email and SMS. The scholarship is valid for the full duration of the course, subject to annual renewal.',
      faqs: [
        { q: 'Is there an entrance test?', a: 'Yes, candidates must qualify the YASASVI Entrance Test (YET) conducted by NTA.' },
        { q: 'Which institutions are covered?', a: 'Top institutions as per NIRF rankings including IITs, NITs, central universities, and select private institutions.' },
      ],
      matchCriteria: (p) => ['OBC', 'EWS'].includes(p.category) && p.percentage >= 60 && p.familyIncome <= 500000,
    },
    {
      id: 'inspire-2026',
      name: 'INSPIRE Scholarship',
      issuer: 'Department of Science & Technology, Govt. of India',
      benefit: '₹80,000 per year',
      benefitAmount: 80000,
      deadline: '30 November 2026',
      objective: 'Innovation in Science Pursuit for Inspired Research (INSPIRE) aims to attract talented students to study science and pursue research careers.',
      eligibility: [
        'Indian citizen',
        'Scored in top 1% in 12th board exams OR',
        'Minimum 85% in 12th science stream',
        'Pursuing B.Sc / B.S / Int. M.Sc in natural/basic sciences',
        'Age below 22 years at the time of application',
      ],
      benefitsText: 'Annual scholarship of ₹80,000 (₹60,000 as scholarship + ₹20,000 as mentorship). Summer attachment with research institutions after 2nd and 3rd year. Priority in national research programs.',
      docsRequired: ['12th Marksheet (Science stream)', 'College Admission Proof', 'Identity Proof', 'Bank Details'],
      guidelines: 'Only students pursuing natural and basic sciences are eligible. Commerce, arts, engineering, and medical students are NOT eligible. The scholarship is tenable in all recognized universities/institutions in India.',
      faqs: [
        { q: 'Can engineering students apply?', a: 'No, INSPIRE is exclusively for students in basic/natural sciences (Physics, Chemistry, Biology, Mathematics).' },
        { q: 'Is there an interview?', a: 'No interview is required. Selection is purely merit-based on 12th board exam performance.' },
      ],
      matchCriteria: (p) => p.percentage >= 85 && ['12th', 'UG'].includes(p.educationLevel),
    },
    {
      id: 'ews-2026',
      name: 'Central Sector Scholarship for EWS',
      issuer: 'Ministry of Education, Govt. of India',
      benefit: '₹20,000 per year',
      benefitAmount: 20000,
      deadline: '31 January 2027',
      objective: 'To provide financial support to economically weaker section students for pursuing higher education in colleges and universities.',
      eligibility: [
        'Indian citizen',
        'Belongs to EWS / General category',
        'Passed 12th with minimum 80% marks',
        'Family annual income below ₹4,50,000',
        'Enrolled in a regular full-time course',
      ],
      benefitsText: 'Annual scholarship of ₹20,000 for 1st to 3rd year of UG studies. ₹25,000 per year for 4th and 5th year of professional courses. ₹30,000 per year for postgraduate studies.',
      docsRequired: ['10th Marksheet', '12th Marksheet', 'Income Certificate', 'EWS Certificate', 'Identity Proof'],
      guidelines: 'The scholarship is awarded purely on merit basis. The student should not be availing any other Central/State Government scholarship. Students must produce genuine certificates and documents.',
      faqs: [
        { q: 'What counts as EWS?', a: 'Families with annual income below ₹8 lakh and no agricultural land above 5 acres are considered EWS (as per government norms).' },
        { q: 'Can private college students apply?', a: 'Yes, students in private colleges recognized by UGC/AICTE are eligible.' },
      ],
      matchCriteria: (p) => ['General', 'EWS'].includes(p.category) && p.percentage >= 80 && p.familyIncome <= 450000,
    },
  ];

  // ─── DOM Helpers ──────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function show(el) {
    if (typeof el === 'string') el = $(el);
    if (el) el.classList.add('visible');
  }

  function hide(el) {
    if (typeof el === 'string') el = $(el);
    if (el) el.classList.remove('visible');
  }

  function showLoading(text = 'Processing…') {
    $('#loadingText').textContent = text;
    show('#loadingOverlay');
  }

  function hideLoading() {
    hide('#loadingOverlay');
  }

  // ─── Navigation ───────────────────────────────
  function goToScreen(num) {
    $$('.screen').forEach((s) => s.classList.remove('active'));
    const target = $(`#screen${['Login', 'Profile', 'Eligibility', 'Details', 'Apply', 'Success'][num - 1]}`);
    if (target) {
      target.classList.add('active');
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    state.currentScreen = num;
    updateProgressBar(num);
    updateBackBtn(num);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateProgressBar(step) {
    const progressStep = Math.min(step, 4);
    $$('.progress-step').forEach((el) => {
      const s = parseInt(el.dataset.step);
      el.classList.remove('active', 'completed');
      if (s < progressStep) el.classList.add('completed');
      else if (s === progressStep) el.classList.add('active');
    });
  }

  function updateBackBtn(step) {
    const btn = $('#globalBackBtn');
    if (step === 1) {
      btn.classList.add('hidden');
    } else {
      btn.classList.remove('hidden');
    }
  }

  // ─── Screen 1: Login / OTP ───────────────────
  let smsBannerTimeout = null;

  function generateRandomOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  function showSmsNotification(otpCode) {
    const bannerContainer = $('#smsBannerContainer');
    if (!bannerContainer) return;

    if (smsBannerTimeout) {
      clearTimeout(smsBannerTimeout);
    }

    bannerContainer.innerHTML = `
      <div class="sms-banner" id="activeSmsBanner">
        <div class="sms-banner-header">
          <div class="sms-banner-header-left">
            <span class="sms-banner-icon">💬</span>
            <span>MESSAGES • Just now</span>
          </div>
          <button type="button" class="sms-banner-close" id="smsBannerCloseBtn" aria-label="Close notification">×</button>
        </div>
        <div class="sms-banner-body">
          <strong>ScholarConnect:</strong> Your one-time verification code is <span class="sms-banner-code">${otpCode}</span>. Valid for 60 seconds. Do not share this code.
        </div>
        <div class="sms-banner-actions">
          <button type="button" class="sms-banner-btn primary" id="smsAutofillBtn">
            ⚡ Auto-fill ${otpCode}
          </button>
          <button type="button" class="sms-banner-btn" id="smsCopyBtn">
            📋 Copy Code
          </button>
        </div>
      </div>
    `;

    // Try subtle haptic vibration if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 60, 40]);
    }

    const bannerEl = $('#activeSmsBanner');
    const closeBtn = $('#smsBannerCloseBtn');
    const autofillBtn = $('#smsAutofillBtn');
    const copyBtn = $('#smsCopyBtn');

    const dismissBanner = () => {
      if (bannerEl) {
        bannerEl.classList.add('dismissing');
        setTimeout(() => {
          bannerContainer.innerHTML = '';
        }, 300);
      }
    };

    closeBtn.addEventListener('click', dismissBanner);

    autofillBtn.addEventListener('click', () => {
      autoFillOtp(otpCode);
      dismissBanner();
    });

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(otpCode);
        copyBtn.textContent = 'Copied ✓';
        setTimeout(() => {
          if (copyBtn) copyBtn.textContent = '📋 Copy Code';
        }, 2000);
      } catch (err) {
        copyBtn.textContent = `${otpCode}`;
      }
    });

    smsBannerTimeout = setTimeout(dismissBanner, 12000);
  }

  function autoFillOtp(otpCode) {
    const otpInputs = $$('.otp-input');
    const digits = otpCode.split('');
    digits.forEach((digit, i) => {
      if (otpInputs[i]) {
        otpInputs[i].value = digit;
        otpInputs[i].classList.add('filled');
        otpInputs[i].classList.remove('input-error');
      }
    });
    $('#otpError').classList.remove('visible');
    if (otpInputs[5]) {
      otpInputs[5].focus();
    }
    // Auto-verify after short delay
    setTimeout(() => {
      verifyCurrentOtp();
    }, 300);
  }

  function clearOtpInputs() {
    const otpInputs = $$('.otp-input');
    otpInputs.forEach((inp) => {
      inp.value = '';
      inp.classList.remove('filled', 'input-error', 'input-success');
    });
    $('#otpError').classList.remove('visible');
  }

  function verifyCurrentOtp() {
    const verifyBtn = $('#verifyOtpBtn');
    const otpInputs = $$('.otp-input');
    const otpInputsContainer = $('#otpInputs');
    const otpError = $('#otpError');
    const otp = Array.from(otpInputs).map((i) => i.value).join('');

    // Check if empty or incomplete
    if (otp.length !== 6) {
      otpError.textContent = 'Please enter all 6 digits of the OTP.';
      otpError.classList.add('visible');
      otpInputsContainer.classList.add('shake');
      setTimeout(() => otpInputsContainer.classList.remove('shake'), 500);
      return;
    }

    // Check if expired
    if (state.otpExpiresAt && Date.now() > state.otpExpiresAt) {
      otpError.textContent = 'OTP has expired. Please click Resend OTP to receive a new code.';
      otpError.classList.add('visible');
      otpInputs.forEach((i) => i.classList.add('input-error'));
      otpInputsContainer.classList.add('shake');
      setTimeout(() => otpInputsContainer.classList.remove('shake'), 500);
      return;
    }

    // Check if correct
    if (otp !== state.currentOtp) {
      otpError.textContent = '❌ Incorrect OTP. The code you entered does not match.';
      otpError.classList.add('visible');
      otpInputs.forEach((i) => i.classList.add('input-error'));
      otpInputsContainer.classList.add('shake');
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([80, 50, 80]);
      }
      setTimeout(() => otpInputsContainer.classList.remove('shake'), 500);
      return;
    }

    // Success!
    otpError.classList.remove('visible');
    otpInputs.forEach((i) => {
      i.classList.remove('input-error');
      i.classList.add('input-success');
    });

    const activeBanner = $('#activeSmsBanner');
    if (activeBanner) {
      activeBanner.classList.add('dismissing');
      setTimeout(() => {
        const c = $('#smsBannerContainer');
        if (c) c.innerHTML = '';
      }, 300);
    }

    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<span class="spinner"></span> Verifying…';

    setTimeout(() => {
      state.otpVerified = true;
      clearInterval(state.otpTimerInterval);
      verifyBtn.innerHTML = 'Verified ✓';
      verifyBtn.style.background = 'var(--success, #16a34a)';
      setTimeout(() => {
        showDigilockerConsent();
      }, 400);
    }, 900);
  }

  function initLogin() {
    const phoneInput = $('#phoneInput');
    const sendOtpBtn = $('#sendOtpBtn');
    const otpSection = $('#otpSection');
    const verifyBtn = $('#verifyOtpBtn');
    const otpInputs = $$('.otp-input');
    const changePhoneBtn = $('#changePhoneBtn');
    const displayPhone = $('#displayPhone');

    // Phone input — numbers only
    phoneInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
      if (e.target.value.length === 10) {
        $('#phoneError').classList.remove('visible');
        phoneInput.classList.remove('error');
      }
    });

    // Enter key on phone input triggers send OTP
    phoneInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendOtpBtn.click();
      }
    });

    // Send OTP
    sendOtpBtn.addEventListener('click', () => {
      const phone = phoneInput.value.trim();
      if (phone.length !== 10) {
        $('#phoneError').classList.add('visible');
        phoneInput.classList.add('error');
        phoneInput.focus();
        return;
      }
      $('#phoneError').classList.remove('visible');
      phoneInput.classList.remove('error');

      state.phone = phone;
      if (displayPhone) displayPhone.textContent = phone;

      sendOtpBtn.disabled = true;
      sendOtpBtn.innerHTML = '<span class="spinner"></span> Sending OTP…';

      setTimeout(() => {
        state.otpSent = true;
        state.currentOtp = generateRandomOtp();
        state.otpExpiresAt = Date.now() + 60 * 1000;

        sendOtpBtn.innerHTML = 'OTP Dispatched ✓';
        sendOtpBtn.style.opacity = '0.7';
        phoneInput.setAttribute('readonly', true);
        otpSection.classList.add('visible');
        clearOtpInputs();
        otpInputs[0].focus();
        startOtpTimer();
        showSmsNotification(state.currentOtp);
      }, 900);
    });

    // Change Phone Number
    if (changePhoneBtn) {
      changePhoneBtn.addEventListener('click', () => {
        clearInterval(state.otpTimerInterval);
        state.otpSent = false;
        state.currentOtp = '';
        phoneInput.removeAttribute('readonly');
        otpSection.classList.remove('visible');
        sendOtpBtn.disabled = false;
        sendOtpBtn.innerHTML = 'Send OTP';
        sendOtpBtn.style.opacity = '1';
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = 'Verify & Continue';
        verifyBtn.style.background = '';
        clearOtpInputs();
        phoneInput.focus();
      });
    }

    // OTP inputs — auto-focus, paste, keyboard handling
    otpInputs.forEach((inp, i) => {
      inp.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 1);
        e.target.value = val;

        // Remove error states when user types
        $('#otpError').classList.remove('visible');
        otpInputs.forEach((el) => el.classList.remove('input-error'));

        if (val) {
          e.target.classList.add('filled');
          if (i < 5) {
            otpInputs[i + 1].focus();
          } else {
            // Auto check on 6th digit
            const currentCode = Array.from(otpInputs).map((x) => x.value).join('');
            if (currentCode.length === 6) {
              setTimeout(() => verifyCurrentOtp(), 150);
            }
          }
        } else {
          e.target.classList.remove('filled');
        }
      });

      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
          if (!e.target.value && i > 0) {
            otpInputs[i - 1].focus();
            otpInputs[i - 1].value = '';
            otpInputs[i - 1].classList.remove('filled', 'input-error');
          } else {
            e.target.value = '';
            e.target.classList.remove('filled', 'input-error');
          }
        } else if (e.key === 'ArrowLeft' && i > 0) {
          otpInputs[i - 1].focus();
        } else if (e.key === 'ArrowRight' && i < 5) {
          otpInputs[i + 1].focus();
        } else if (e.key === 'Enter') {
          verifyCurrentOtp();
        }
      });

      // Handle full Paste
      inp.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData.length > 0) {
          pastedData.split('').forEach((ch, ci) => {
            if (otpInputs[ci]) {
              otpInputs[ci].value = ch;
              otpInputs[ci].classList.add('filled');
              otpInputs[ci].classList.remove('input-error');
            }
          });
          const nextFocus = Math.min(pastedData.length, 5);
          otpInputs[nextFocus].focus();
          if (pastedData.length === 6) {
            setTimeout(() => verifyCurrentOtp(), 150);
          }
        }
      });
    });

    // Verify OTP Button
    verifyBtn.addEventListener('click', () => {
      verifyCurrentOtp();
    });
  }

  function startOtpTimer() {
    let seconds = 30;
    const timerEl = $('#otpTimer');
    clearInterval(state.otpTimerInterval);

    timerEl.innerHTML = `Resend OTP in <strong id="otpCountdown">${seconds}s</strong>`;

    state.otpTimerInterval = setInterval(() => {
      seconds--;
      const countdownEl = $('#otpCountdown');
      if (seconds <= 0) {
        clearInterval(state.otpTimerInterval);
        timerEl.innerHTML = '<span class="resend-link" id="resendOtp">Resend OTP</span>';
        const resendBtn = $('#resendOtp');
        if (resendBtn) {
          resendBtn.addEventListener('click', () => {
            state.currentOtp = generateRandomOtp();
            state.otpExpiresAt = Date.now() + 60 * 1000;
            clearOtpInputs();
            const otpInputs = $$('.otp-input');
            if (otpInputs[0]) otpInputs[0].focus();
            showSmsNotification(state.currentOtp);
            startOtpTimer();
          });
        }
      } else if (countdownEl) {
        countdownEl.textContent = `${seconds}s`;
      }
    }, 1000);
  }

  // ─── DigiLocker Consent Modal ─────────────────
  function showDigilockerConsent() {
    hideLoading();
    show('#digilockerModal');
  }

  function initDigilocker() {
    $('#digilockerConsent').addEventListener('click', () => {
      hide('#digilockerModal');
      showLoading('Fetching data from DigiLocker…');

      setTimeout(() => {
        state.digilockerData = { ...MOCK_DIGILOCKER_DATA };
        state.digilockerData.personalMobile = state.phone;
        hideLoading();
        populateProfile();
        goToScreen(2);
      }, 2500);
    });

    $('#digilockerCancel').addEventListener('click', () => {
      hide('#digilockerModal');
      // Reset verify button
      const verifyBtn = $('#verifyOtpBtn');
      verifyBtn.disabled = false;
      verifyBtn.innerHTML = 'Verify & Continue';
    });
  }

  // ─── Screen 2: Profile ───────────────────────
  function populateProfile() {
    const d = state.digilockerData;
    $('#fullName').value = d.fullName;
    $('#fatherName').value = d.fatherName;
    $('#motherName').value = d.motherName;
    $('#personalMobile').value = '+91 ' + d.personalMobile;
    $('#fatherMobile').value = d.fatherMobile;
    $('#motherMobile').value = d.motherMobile;
    $('#dob').value = d.dob;
    $('#gender').value = d.gender;
    $('#currentAddress').value = d.currentAddress;
    $('#permanentAddress').value = d.permanentAddress;
    $('#category').value = d.category;
    $('#familyIncome').value = d.familyIncome;
    $('#educationLevel').value = d.educationLevel;
    $('#percentage').value = d.percentage;
    $('#state').value = d.state;
  }

  function initProfile() {
    // Same address checkbox
    $('#sameAddress').addEventListener('change', (e) => {
      if (e.target.checked) {
        $('#permanentAddress').value = $('#currentAddress').value;
        $('#permanentAddress').setAttribute('readonly', true);
      } else {
        $('#permanentAddress').removeAttribute('readonly');
      }
    });

    // ID proof selector
    $$('#idProofSelector .id-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        $$('#idProofSelector .id-chip').forEach((c) => c.classList.remove('selected'));
        chip.classList.add('selected');
        state.selectedIdType = chip.dataset.id;
        const names = { 'aadhaar': 'Aadhaar Card', 'passport': 'Passport', 'birth-cert': 'Birth Certificate' };
        $('#idProofTitle').textContent = names[chip.dataset.id];

        // Reset if already uploaded
        const card = $('#docIdProof');
        if (card.classList.contains('uploaded')) {
          card.classList.remove('uploaded');
          delete state.uploadedDocs['idProof'];
        }
      });
    });

    // Doc upload cards
    initDocUpload('doc10th', 'file10th', 'marksheet10');
    initDocUpload('doc12th', 'file12th', 'marksheet12');
    initDocUpload('docCaste', 'fileCaste', 'casteCert');
    initDocUpload('docIdProof', 'fileIdProof', 'idProof');

    // Continue button
    $('#profileContinueBtn').addEventListener('click', () => {
      // Gather profile
      state.profile = {
        fullName: $('#fullName').value,
        fatherName: $('#fatherName').value,
        motherName: $('#motherName').value,
        personalMobile: state.phone,
        fatherMobile: $('#fatherMobile').value,
        motherMobile: $('#motherMobile').value,
        guardianMobile: $('#guardianMobile').value,
        dob: $('#dob').value,
        gender: $('#gender').value,
        category: $('#category').value,
        familyIncome: parseInt($('#familyIncome').value) || 0,
        educationLevel: $('#educationLevel').value,
        percentage: parseFloat($('#percentage').value) || 0,
        currentAddress: $('#currentAddress').value,
        permanentAddress: $('#permanentAddress').value,
        state: $('#state').value,
      };

      // Validate required
      if (!state.profile.category || !state.profile.educationLevel || !state.profile.percentage || !state.profile.currentAddress || !state.profile.state) {
        alert('Please fill in all required fields: Category, Education Level, Academic %, Address, and State.');
        return;
      }

      if (!state.uploadedDocs['marksheet10'] && !state.uploadedDocs['marksheet12']) {
        alert('Please upload at least your 10th or 12th marksheet.');
        return;
      }

      if (!state.uploadedDocs['idProof']) {
        alert('Please upload an identity proof document.');
        return;
      }

      goToScreen(3);
      runEligibilityCheck();
    });
  }

  function initDocUpload(cardId, inputId, docKey) {
    const card = $(`#${cardId}`);
    const input = $(`#${inputId}`);
    const removeBtn = card.querySelector('.remove-btn');

    card.addEventListener('click', (e) => {
      if (e.target === removeBtn || removeBtn.contains(e.target)) return;
      if (!card.classList.contains('uploaded')) {
        input.click();
      }
    });

    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('File size exceeds 5 MB. Please choose a smaller file.');
          return;
        }
        state.uploadedDocs[docKey] = {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type,
        };
        card.classList.add('uploaded');
        card.querySelector('.upload-title').textContent = file.name;
      }
    });

    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      card.classList.remove('uploaded');
      input.value = '';
      delete state.uploadedDocs[docKey];

      // Restore original title
      const titles = {
        'marksheet10': '10th Marksheet',
        'marksheet12': '12th Marksheet',
        'casteCert': 'Caste Certificate',
        'idProof': { 'aadhaar': 'Aadhaar Card', 'passport': 'Passport', 'birth-cert': 'Birth Certificate' }[state.selectedIdType],
      };
      card.querySelector('.upload-title').textContent = titles[docKey] || 'Document';
    });
  }

  // ─── Screen 3: Eligibility Check ─────────────
  function runEligibilityCheck() {
    const checking = $('#eligibilityChecking');
    const results = $('#eligibilityResults');
    const steps = $$('#checkSteps li');

    checking.style.display = 'block';
    results.style.display = 'none';

    // Animate check steps
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      if (stepIndex > 0) {
        steps[stepIndex - 1].classList.remove('active');
        steps[stepIndex - 1].classList.add('done');
        steps[stepIndex - 1].querySelector('.li-icon').textContent = '✅';
      }
      if (stepIndex < steps.length) {
        steps[stepIndex].classList.add('active');
        steps[stepIndex].querySelector('.li-icon').textContent = '⏳';
        stepIndex++;
      } else {
        clearInterval(stepInterval);
        setTimeout(() => {
          checking.style.display = 'none';
          showEligibilityResults();
        }, 600);
      }
    }, 800);
  }

  function showEligibilityResults() {
    const results = $('#eligibilityResults');
    const list = $('#scholarshipList');
    const noResults = $('#noResults');

    // Match scholarships
    state.scholarships = SCHOLARSHIP_DB.filter((s) => s.matchCriteria(state.profile));

    results.style.display = 'block';

    if (state.scholarships.length === 0) {
      noResults.style.display = 'block';
      list.style.display = 'none';
      return;
    }

    noResults.style.display = 'none';
    list.style.display = 'block';
    list.innerHTML = '';

    state.scholarships.forEach((s, idx) => {
      const card = document.createElement('div');
      card.className = `scholarship-card fade-in-up delay-${idx + 1}`;
      card.innerHTML = `
        <div class="scholarship-header">
          <div class="scholarship-icon">🎓</div>
          <div class="scholarship-info">
            <h3>${s.name}</h3>
            <div class="issuer">${s.issuer}</div>
          </div>
        </div>
        <div class="scholarship-eligible-badge">
          <span>✓</span> Eligible
        </div>
        <div class="scholarship-details-row">
          <div class="scholarship-detail">
            <span class="detail-label">Benefit</span>
            <span class="detail-value highlight">${s.benefit}</span>
          </div>
          <div class="scholarship-detail">
            <span class="detail-label">Deadline</span>
            <span class="detail-value">${s.deadline}</span>
          </div>
        </div>
        <div class="scholarship-actions">
          <button class="btn btn-outline btn-sm" data-action="details" data-id="${s.id}">View Details</button>
          <button class="btn btn-primary btn-sm" data-action="apply" data-id="${s.id}" style="box-shadow:none;">Apply Now</button>
        </div>
      `;
      list.appendChild(card);
    });

    // Bind actions
    list.querySelectorAll('[data-action="details"]').forEach((btn) => {
      btn.addEventListener('click', () => openScholarshipDetails(btn.dataset.id));
    });

    list.querySelectorAll('[data-action="apply"]').forEach((btn) => {
      btn.addEventListener('click', () => openApplicationForm(btn.dataset.id));
    });
  }

  // ─── Screen 4A: Scholarship Details ──────────
  function openScholarshipDetails(id) {
    const s = SCHOLARSHIP_DB.find((x) => x.id === id);
    if (!s) return;
    state.selectedScholarship = s;

    $('#detailsHeading').textContent = s.name;
    $('#detailDept').textContent = s.issuer;
    $('#detailBenefit').innerHTML = `💰 ${s.benefit}`;
    $('#detailObjective').textContent = s.objective;
    $('#detailBenefitsText').textContent = s.benefitsText;
    $('#detailDeadline').textContent = s.deadline;
    $('#detailGuidelines').textContent = s.guidelines;

    // Eligibility list
    const eligList = $('#detailEligibility');
    eligList.innerHTML = '';
    s.eligibility.forEach((e) => {
      const li = document.createElement('li');
      li.textContent = e;
      eligList.appendChild(li);
    });

    // Docs required
    const docsList = $('#detailDocsRequired');
    docsList.innerHTML = '';
    s.docsRequired.forEach((d) => {
      const li = document.createElement('li');
      li.textContent = d;
      docsList.appendChild(li);
    });

    // FAQs
    const faqsEl = $('#detailFaqs');
    faqsEl.innerHTML = '';
    s.faqs.forEach((faq) => {
      const item = document.createElement('div');
      item.className = 'faq-item';
      item.innerHTML = `
        <div class="faq-question">
          <span>${faq.q}</span>
          <span class="faq-arrow">▼</span>
        </div>
        <div class="faq-answer">${faq.a}</div>
      `;
      item.querySelector('.faq-question').addEventListener('click', () => {
        item.classList.toggle('open');
      });
      faqsEl.appendChild(item);
    });

    goToScreen(4);
  }

  function initDetails() {
    $('#detailApplyBtn').addEventListener('click', () => {
      if (state.selectedScholarship) {
        openApplicationForm(state.selectedScholarship.id);
      }
    });

    $('#detailBackBtn').addEventListener('click', () => {
      goToScreen(3);
    });
  }

  // ─── Screen 4B: Application Form ─────────────
  function openApplicationForm(id) {
    const s = SCHOLARSHIP_DB.find((x) => x.id === id);
    if (!s) return;
    state.selectedScholarship = s;

    $('#applyScholarshipName').textContent = s.name + ' — ' + s.issuer;

    // Pre-fill info table
    const table = $('#applyInfoTable');
    const p = state.profile;
    const idTypes = { 'aadhaar': 'Aadhaar Card', 'passport': 'Passport', 'birth-cert': 'Birth Certificate' };
    const rows = [
      ['Full Name', p.fullName],
      ['Father\'s Name', p.fatherName],
      ['Mother\'s Name', p.motherName],
      ['Mobile', '+91 ' + p.personalMobile],
      ['Date of Birth', p.dob],
      ['Gender', p.gender],
      ['Category', p.category],
      ['Education Level', p.educationLevel],
      ['Academic %', p.percentage + '%'],
      ['Family Income', '₹' + p.familyIncome.toLocaleString('en-IN')],
      ['State', p.state],
      ['Address', p.currentAddress],
      ['Identity Proof', idTypes[state.selectedIdType]],
    ];

    table.innerHTML = '';
    rows.forEach(([label, val]) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${label}</td><td>${val}</td>`;
      table.appendChild(tr);
    });

    // Attached docs
    const docsEl = $('#applyDocs');
    docsEl.innerHTML = '';

    const docLabels = {
      marksheet10: '10th Marksheet',
      marksheet12: '12th Marksheet',
      idProof: idTypes[state.selectedIdType],
      casteCert: 'Caste Certificate',
    };

    Object.entries(state.uploadedDocs).forEach(([key, doc]) => {
      const div = document.createElement('div');
      div.className = 'attached-doc';
      div.innerHTML = `
        <div class="doc-icon">📄</div>
        <div>
          <div class="doc-name">${docLabels[key] || key}</div>
          <div class="doc-size">${doc.name} • ${doc.size}</div>
        </div>
        <div class="doc-check">✓</div>
      `;
      docsEl.appendChild(div);
    });

    // Declaration
    const declCheck = $('#declarationCheck');
    const submitBtn = $('#submitApplicationBtn');
    declCheck.checked = false;
    submitBtn.disabled = true;

    goToScreen(5);
    updateProgressBar(4);
  }

  function initApplication() {
    const declCheck = $('#declarationCheck');
    const submitBtn = $('#submitApplicationBtn');

    declCheck.addEventListener('change', () => {
      submitBtn.disabled = !declCheck.checked;
    });

    submitBtn.addEventListener('click', () => {
      if (!declCheck.checked) return;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner"></span> Submitting…';

      setTimeout(() => {
        const refId = 'SC-2026-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        $('#successRef').innerHTML = `📋 Ref: ${refId}`;
        goToScreen(6);
        updateProgressBar(5);
      }, 2500);
    });
  }

  // ─── Screen 5: Success ───────────────────────
  function initSuccess() {
    $('#goHomeBtn').addEventListener('click', () => {
      location.reload();
    });
  }

  // ─── Global Back Button ──────────────────────
  function initBackButton() {
    $('#globalBackBtn').addEventListener('click', () => {
      const screen = state.currentScreen;
      // Map screens to back targets
      if (screen === 2) goToScreen(1);        // Profile → Login (shouldn't normally go back)
      else if (screen === 3) goToScreen(2);    // Eligibility → Profile
      else if (screen === 4) goToScreen(3);    // Details → Eligibility
      else if (screen === 5) goToScreen(3);    // Apply → Eligibility
      else if (screen === 6) goToScreen(3);    // Success → Eligibility
    });
  }

  // ─── Initialization ──────────────────────────
  function init() {
    initLogin();
    initDigilocker();
    initProfile();
    initDetails();
    initApplication();
    initSuccess();
    initBackButton();
  }

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API for inline handlers
  return { goToScreen };
})();
