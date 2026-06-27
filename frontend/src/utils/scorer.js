const CONSULTING_COMPANIES = new Set([
  "tcs", "tata consultancy services", "infosys", "wipro", "accenture", 
  "cognizant", "capgemini", "mindtree", "hcl", "tech mahindra", "l&t", "cts"
]);

const CV_SPEECH_SKILLS = new Set([
  "computer vision", "image classification", "gans", "speech recognition", 
  "tts", "robotics", "ros", "object detection", "image segmentation", "yolo"
]);

const SKILL_ALIASES = {
  "tensor flow": "tensorflow",
  "tensor-flow": "tensorflow",
  "py torch": "pytorch",
  "py-torch": "pytorch",
  "scikit learn": "scikit-learn",
  "scikitlearn": "scikit-learn",
  "machine-learning": "machine learning",
  "deep-learning": "deep learning",
  "vector search": "vector",
  "vector databases": "vector",
  "vector database": "vector",
  "natural language processing": "nlp",
  "computer-vision": "computer vision",
  "generative ai": "llm",
  "genai": "llm",
  "large language models": "llm",
  "large language model": "llm",
  "fine tuning": "fine-tuning",
  "finetuning": "fine-tuning",
};

function normalizeText(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s\-\.\+#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function scoreCandidate(
  candidate,
  requiredSkills,
  preferredSkills,
  minExp = 5
) {
  const profile = candidate.profile;
  const rawSkills = candidate.skills;
  const history = candidate.career_history;
  const signals = candidate.redrob_signals;
  const yearsExp = profile.years_of_experience;
  
  // 1. Process candidate skills
  const skills = {};
  for (const s of rawSkills) {
    const norm = SKILL_ALIASES[normalizeText(s.name)] || normalizeText(s.name);
    if (!norm) continue;
    
    const assessScore = signals.skill_assessment_scores[s.name] !== undefined 
      ? signals.skill_assessment_scores[s.name] 
      : -1.0;
      
    if (!skills[norm] || s.duration_months > skills[norm].duration) {
      skills[norm] = {
        duration: s.duration_months,
        proficiency: s.proficiency.toLowerCase(),
        endorsements: s.endorsements,
        score: assessScore
      };
    }
  }

  // 2. Compute Skill Match Score (0-100)
  let skillMatch = 100.0;
  if (requiredSkills.size > 0) {
    const getMatchScore = (targetSet) => {
      if (targetSet.size === 0) return 1.0;
      let sum = 0.0;
      for (const skill of targetSet) {
        if (skills[skill]) {
          const detail = skills[skill];
          const durationFactor = Math.min(1.0, detail.duration / 24.0);
          
          let modifier = 0.0;
          if (detail.proficiency === "expert") modifier = 0.2;
          else if (detail.proficiency === "advanced") modifier = 0.1;
          else if (detail.proficiency === "beginner") modifier = -0.2;
          
          let factor = Math.max(0.2, durationFactor + modifier);
          if (detail.score >= 0.0) {
            factor = (factor * 0.7) + ((detail.score / 100.0) * 0.3);
          }
          
          const endorseBonus = Math.min(1.0, detail.endorsements / 20.0) * 0.1;
          sum += Math.min(1.0, factor + endorseBonus);
        }
      }
      return sum / targetSet.size;
    };
    
    const reqMatch = getMatchScore(requiredSkills);
    const prefMatch = preferredSkills.size > 0 ? getMatchScore(preferredSkills) : 1.0;
    skillMatch = (reqMatch * 85.0) + (prefMatch * 15.0);
    
    // CV/Speech Penalty Check
    const hasCVSpeech = Object.keys(skills).some(s => CV_SPEECH_SKILLS.has(s));
    const hasNLPSearch = Object.keys(skills).some(s => ["nlp", "llm", "retrieval", "embeddings", "vector", "ranking", "rag"].includes(s));
    if (hasCVSpeech && !hasNLPSearch) {
      skillMatch = Math.max(20.0, skillMatch - 40.0);
    }
  }

  // 3. Compute Experience Match Score (0-100)
  let expMatch = 0.0;
  if (6.0 <= yearsExp && yearsExp <= 8.0) {
    expMatch = 100.0;
  } else if ((5.0 <= yearsExp && yearsExp < 6.0) || (8.0 < yearsExp && yearsExp <= 9.0)) {
    expMatch = 95.0;
  } else if (yearsExp < 5.0) {
    const shortfall = 5.0 - yearsExp;
    expMatch = Math.max(0.0, 100.0 - (shortfall * 15.0));
  } else {
    const excess = yearsExp - 9.0;
    expMatch = Math.max(40.0, 95.0 - (excess * 6.0));
  }

  // 4. Compute Career Relevance (0-100)
  let careerRelevance = 30.0;
  let serviceCompaniesCount = 0;
  const companyCount = history.length;
  let isTitleChaser = false;
  let isPureResearch = false;
  
  if (companyCount > 0) {
    const durations = history.map(h => h.duration_months);
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);
    const avgDuration = totalDuration / companyCount;
    isTitleChaser = companyCount >= 3 && avgDuration <= 18;
    
    const currentTitle = normalizeText(history[0].title);
    isPureResearch = currentTitle.includes("research scientist") || currentTitle.includes("researcher");
    
    const highKeywords = ["ai", "machine learning", "ml", "nlp", "search", "retrieval", "ranking", "recommendation"];
    const medKeywords = ["data scientist", "research scientist", "algorithm", "scientist"];
    const lowKeywords = ["software", "developer", "engineer", "backend", "fullstack"];
    
    let totalWeight = 0.0;
    let durationWeightSum = 0.0;
    
    history.forEach((role, idx) => {
      const title = normalizeText(role.title);
      const company = normalizeText(role.company);
      const duration = role.duration_months;
      
      if (Array.from(CONSULTING_COMPANIES).some(sc => company.includes(sc))) {
        serviceCompaniesCount++;
      }
      
      const recencyFactor = idx === 0 ? 2.0 : (idx === 1 ? 1.5 : 1.0);
      let roleRelevance = 0.0;
      
      if (highKeywords.some(kw => title.includes(kw))) {
        roleRelevance = 1.0;
      } else if (medKeywords.some(kw => title.includes(kw))) {
        roleRelevance = 0.6;
      } else if (lowKeywords.some(kw => title.includes(kw))) {
        roleRelevance = 0.4;
      }
      
      if (["senior", "sr", "lead", "principal", "staff"].some(s => title.includes(s))) {
        roleRelevance = Math.min(1.0, roleRelevance + 0.15);
      }
      
      const weightedDuration = duration * recencyFactor;
      durationWeightSum += weightedDuration;
      totalWeight += (roleRelevance * weightedDuration);
    });
    
    const historyScore = durationWeightSum > 0 ? (totalWeight / durationWeightSum * 100.0) : 50.0;
    
    let penalties = 0.0;
    if (serviceCompaniesCount === companyCount) {
      penalties += 50.0;
    } else if (history[0] && Array.from(CONSULTING_COMPANIES).some(sc => normalizeText(history[0].company).includes(sc))) {
      penalties += 15.0;
    }
    
    if (isTitleChaser) penalties += 25.0;
    if (isPureResearch) penalties += 15.0;
    
    let currentBonus = 0.0;
    if (highKeywords.some(kw => currentTitle.includes(kw))) {
      currentBonus = 15.0;
      if (currentTitle.includes("senior") || currentTitle.includes("sr")) {
        currentBonus += 5.0;
      }
    }
    
    careerRelevance = Math.max(0.0, Math.min(100.0, historyScore + currentBonus - penalties));
  }

  // 5. Compute Behavioral Score (0-100)
  const respRate = signals.recruiter_response_rate;
  const githubScore = signals.github_activity_score;
  const completionRate = signals.interview_completion_rate;
  const saves30d = signals.saved_by_recruiters_30d;
  const searches30d = signals.search_appearance_30d;
  const openToWork = signals.open_to_work_flag;
  const willingRelocate = signals.willing_to_relocate;
  const noticePeriod = signals.notice_period_days;
  const lastActive = signals.last_active_date;
  const location = normalizeText(profile.location);
  const country = normalizeText(profile.country);
  
  const savesNormalized = Math.min(10.0, saves30d) / 10.0;
  const searchesNormalized = Math.min(150.0, searches30d) / 150.0;
  
  const githubFactor = githubScore >= 0.0 ? (githubScore / 100.0) : 0.5;
  
  const baseBehavioral = (
    (respRate * 25.0) +
    (githubFactor * 15.0) +
    (completionRate * 25.0) +
    (savesNormalized * 10.0) +
    (searchesNormalized * 10.0)
  );
  
  let behaviorModifier = 0.0;
  if (openToWork) behaviorModifier += 10.0;
  
  if (noticePeriod <= 30) behaviorModifier += 15.0;
  else if (noticePeriod <= 60) behaviorModifier += 5.0;
  else if (noticePeriod > 90) behaviorModifier -= 20.0;
  
  if (lastActive) {
    try {
      const activeTime = new Date(lastActive).getTime();
      const baselineTime = new Date("2026-06-21").getTime();
      const inactiveDays = (baselineTime - activeTime) / (1000 * 60 * 60 * 24);
      if (inactiveDays > 90) {
        behaviorModifier -= 20.0;
      }
    } catch {}
  }
  
  const isIndia = country.includes("india") || location.includes("india");
  if (["noida", "pune"].some(city => location.includes(city))) {
    behaviorModifier += 15.0;
  } else if (["hyderabad", "mumbai", "delhi", "ncr"].some(city => location.includes(city))) {
    behaviorModifier += 8.0;
  } else if (isIndia) {
    behaviorModifier += 3.0;
  } else if (country && !country.includes("india")) {
    behaviorModifier -= 10.0;
  }
  
  const behavioralScore = Math.max(0.0, Math.min(100.0, baseBehavioral + behaviorModifier));

  // 6. Detect Suspicious Honeypot Patterns (100 pts penalty per trigger)
  let penaltyTotal = 0.0;
  const flags = [];
  
  // Honeypot 1: Skill duration exceeds total experience
  for (const s of rawSkills) {
    const durationYears = s.duration_months / 12.0;
    if (s.duration_months > 0 && durationYears > (yearsExp + 0.5)) {
      penaltyTotal += 100.0;
      flags.push(`HONEYPOT_SKILL_EXP_DISCREPANCY_${s.name.toUpperCase()}`);
    }
  }
  
  // Honeypot 2: Expert skills with 0 duration
  for (const s of rawSkills) {
    if (s.proficiency.toLowerCase() === "expert" && s.duration_months === 0) {
      penaltyTotal += 100.0;
      flags.push(`HONEYPOT_EXPERT_0_MONTHS_${s.name.toUpperCase()}`);
    }
  }
  
  // Honeypot 3: Future tech duration anomaly
  const recentTechs = ["langchain", "llamaindex", "chatgpt", "gpt-4", "qdrant"];
  for (const s of rawSkills) {
    const nameLower = s.name.toLowerCase();
    if (recentTechs.some(tech => nameLower.includes(tech))) {
      if (s.duration_months > 42) {
        penaltyTotal += 100.0;
        flags.push(`HONEYPOT_FUTURE_TECH_DURATION_${s.name.toUpperCase()}`);
      }
    }
  }

  // Honeypot 4: Overlapping Job Timelines
  if (history.length > 1) {
    const intervals = [];
    history.forEach(role => {
      if (role.start_date) {
        try {
          const start = new Date(role.start_date).getTime();
          const end = role.end_date ? new Date(role.end_date).getTime() : new Date("2026-06-21").getTime();
          intervals.push({ start, end });
        } catch {}
      }
    });
    
    intervals.sort((a, b) => a.start - b.start);
    let totalOverlapMonths = 0.0;
    for (let i = 0; i < intervals.length - 1; i++) {
      const currEnd = intervals[i].end;
      const nextStart = intervals[i+1].start;
      if (currEnd > nextStart) {
        const overlapEnd = Math.min(currEnd, intervals[i+1].end);
        const diffMs = overlapEnd - nextStart;
        const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.4);
        if (diffMonths > 0) {
          totalOverlapMonths += diffMonths;
        }
      }
    }
    
    if (totalOverlapMonths > 4.0) {
      penaltyTotal += 100.0;
      flags.push("HONEYPOT_CHRONOLOGICAL_OVERLAP");
    }
  }

  // Honeypot 5: Role duration exceeds total experience
  for (const role of history) {
    const durationYears = role.duration_months / 12.0;
    if (durationYears > (yearsExp + 0.5)) {
      penaltyTotal += 100.0;
      flags.push("HONEYPOT_ROLE_DURATION_EXCEEDS_EXP");
    }
  }

  // 7. Calculate final score
  const weightedScore = (
    (skillMatch * 0.40) +
    (expMatch * 0.20) +
    (careerRelevance * 0.20) +
    (behavioralScore * 0.20)
  );
  
  const finalScore = Math.max(0.0, Math.min(100.0, weightedScore - penaltyTotal));

  return {
    final_score: Math.round(finalScore * 100) / 100,
    skill_match: Math.round(skillMatch * 100) / 100,
    experience_match: Math.round(expMatch * 100) / 100,
    career_relevance: Math.round(careerRelevance * 100) / 100,
    behavioral_score: Math.round(behavioralScore * 100) / 100,
    penalty_total: penaltyTotal,
    flags
  };
}
