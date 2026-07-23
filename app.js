const XP_DATA = {
  labs: {
    machines: {
      very_easy: { label: "Very Easy Machine", user: 100, root: 150, total: 250 },
      easy: { label: "Easy Machine", user: 200, root: 250, total: 450 },
      medium: { label: "Medium Machine", user: 300, root: 350, total: 650 },
      hard: { label: "Hard Machine", user: 400, root: 450, total: 850 },
      insane: { label: "Insane Machine", user: 500, root: 550, total: 1050 }
    },
    challenges: {
      very_easy: { label: "Very Easy Challenge", xp: 100 },
      easy: { label: "Easy Challenge", xp: 200 },
      medium: { label: "Medium Challenge", xp: 300 },
      hard: { label: "Hard Challenge", xp: 400 },
      insane: { label: "Insane Challenge", xp: 500 }
    }
  }
};

const RANK_THRESHOLDS = [
  { rank: "Beginner I", family: "Beginner", level: 1 },
  { rank: "Beginner II", family: "Beginner", level: 6 },
  { rank: "Beginner III", family: "Beginner", level: 11 },
  { rank: "Apprentice I", family: "Apprentice", level: 16 },
  { rank: "Apprentice II", family: "Apprentice", level: 21 },
  { rank: "Apprentice III", family: "Apprentice", level: 26 },
  { rank: "Skilled I", family: "Skilled", level: 31 },
  { rank: "Skilled II", family: "Skilled", level: 36 },
  { rank: "Skilled III", family: "Skilled", level: 41 },
  { rank: "Professional I", family: "Professional", level: 46 },
  { rank: "Professional II", family: "Professional", level: 51 },
  { rank: "Professional III", family: "Professional", level: 56 },
  { rank: "Master I", family: "Master", level: 61 },
  { rank: "Master II", family: "Master", level: 66 },
  { rank: "Master III", family: "Master", level: 71 },
  { rank: "Prodigy I", family: "Prodigy", level: 76 },
  { rank: "Prodigy II", family: "Prodigy", level: 81 },
  { rank: "Prodigy III", family: "Prodigy", level: 86 },
  { rank: "Grandmaster I", family: "Grandmaster", level: 91 },
  { rank: "Grandmaster II", family: "Grandmaster", level: 100 },
  { rank: "Grandmaster III", family: "Grandmaster", level: 106 }
];

const RANK_FAMILIES = [...new Set(RANK_THRESHOLDS.map((rank) => rank.family))];
const DIFFICULTY_ORDER = ["very_easy", "easy", "medium", "hard", "insane"];
const MAX_SUPPORTED_LEVEL = 157;

// Community-researched HTB thresholds collected manually in July 2026.
// Missing levels are estimated between the nearest verified data points.
const MANUAL_XP_BY_LEVEL = {
  0: 150, 1: 150, 2: 196, 3: 221, 4: 240, 5: 257, 6: 273, 7: 288,
  8: 302, 9: 318, 10: 331, 11: 347, 12: 361, 13: 376, 14: 391, 15: 407,
  16: 422, 17: 439, 18: 455, 19: 472, 20: 489, 21: 508, 22: 525, 24: 564,
  25: 584, 26: 604, 27: 625, 28: 647, 29: 669, 30: 691, 31: 716,
  32: 739, 33: 765, 34: 790, 35: 817, 36: 843, 37: 872, 38: 901, 39: 930, 40: 960,
  41: 992, 42: 1024, 43: 1058, 44: 1091, 45: 1127, 46: 1163,
  47: 1200, 48: 1239, 49: 1278, 50: 1319, 51: 1361, 52: 1404,
  53: 1448, 54: 1494, 55: 1541, 56: 1589, 57: 1638, 58: 1690,
  59: 1743, 60: 1797, 61: 1852, 62: 1910, 63: 1969, 64: 2030, 65: 2092,
  67: 2223, 68: 2290, 69: 2361, 70: 2433, 71: 2507, 72: 2584, 75: 2826,
  76: 2911, 77: 2999, 78: 3090, 79: 3182, 80: 3279, 81: 3376,
  85: 3799, 87: 4030, 88: 4149, 89: 4273, 90: 4400, 91: 4530,
  93: 4803, 94: 4944, 95: 5091, 96: 5240, 100: 5885, 101: 6058,
  103: 6418, 104: 6606, 105: 6799, 107: 7202, 108: 7413,
  111: 8079, 113: 8555, 122: 11059, 123: 11378, 134: 15538,
  141: 18925, 143: 20019, 157: 29632
};

const VERIFIED_XP_LEVELS = Object.keys(MANUAL_XP_BY_LEVEL).map(Number).sort((a, b) => a - b);

const elements = {
  currentLevel: document.querySelector("#currentLevel"),
  currentXp: document.querySelector("#currentXp"),
  targetMode: document.querySelector("#targetMode"),
  goalSelect: document.querySelector("#goalSelect"),
  goalLevel: document.querySelector("#goalLevel"),
  goalRankField: document.querySelector("#goalRankField"),
  goalLevelField: document.querySelector("#goalLevelField"),
  activityGoalSelect: document.querySelector("#activityGoalSelect"),
  activityType: document.querySelector("#activityType"),
  activityDifficulty: document.querySelector("#activityDifficulty"),
  currentRank: document.querySelector("#currentRank"),
  targetRank: document.querySelector("#targetRank"),
  targetRemainingXp: document.querySelector("#targetRemainingXp"),
  progressLabel: document.querySelector("#progressLabel"),
  levelRange: document.querySelector("#levelRange"),
  progressFill: document.querySelector("#progressFill"),
  xpGain: document.querySelector("#xpGain"),
  xpGainLevel: document.querySelector("#xpGainLevel"),
  xpGainRank: document.querySelector("#xpGainRank"),
  xpGainProgress: document.querySelector("#xpGainProgress"),
  rankProjection: document.querySelector("#rankProjection"),
  equivalencyBase: document.querySelector("#equivalencyBase"),
  activityRewardLabel: document.querySelector("#activityRewardLabel"),
  activityCount: document.querySelector("#activityCount"),
  activityCountLabel: document.querySelector("#activityCountLabel"),
  activityBreakdown: document.querySelector("#activityBreakdown")
};

function xpForNextLevel(level) {
  const normalizedLevel = clampNumber(level, 0, MAX_SUPPORTED_LEVEL, 0);
  const verifiedXp = MANUAL_XP_BY_LEVEL[normalizedLevel];

  if (verifiedXp !== undefined) {
    return verifiedXp;
  }

  const lowerLevel = VERIFIED_XP_LEVELS.filter((item) => item < normalizedLevel).at(-1);
  const upperLevel = VERIFIED_XP_LEVELS.find((item) => item > normalizedLevel);

  if (lowerLevel === undefined || upperLevel === undefined) {
    return MANUAL_XP_BY_LEVEL[lowerLevel ?? upperLevel] ?? 150;
  }

  const lowerXp = MANUAL_XP_BY_LEVEL[lowerLevel];
  const upperXp = MANUAL_XP_BY_LEVEL[upperLevel];
  const position = (normalizedLevel - lowerLevel) / (upperLevel - lowerLevel);

  return Math.round(lowerXp * Math.pow(upperXp / lowerXp, position));
}

function xpRemainingToLevel(currentLevel, currentXp, targetLevel) {
  if (targetLevel <= currentLevel) {
    return 0;
  }

  let total = Math.max(0, xpForNextLevel(currentLevel) - currentXp);
  for (let level = currentLevel + 1; level < targetLevel; level += 1) {
    total += xpForNextLevel(level);
  }
  return total;
}

function applyXpGain(currentLevel, currentXp, xpGain) {
  let level = currentLevel;
  let xp = currentXp + xpGain;

  while (level < MAX_SUPPORTED_LEVEL && xp >= xpForNextLevel(level)) {
    xp -= xpForNextLevel(level);
    level += 1;
  }

  return {
    level,
    xp,
    nextLevelXp: xpForNextLevel(level)
  };
}

function rankForLevel(level) {
  return RANK_THRESHOLDS.filter((rank) => level >= rank.level).at(-1)?.rank ?? "Unranked";
}

function currentRankThreshold(level) {
  return RANK_THRESHOLDS.filter((rank) => level >= rank.level).at(-1) ?? RANK_THRESHOLDS[0];
}

function nextRankThreshold(level) {
  return RANK_THRESHOLDS.find((rank) => level < rank.level) ?? null;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.floor(number)));
}

function populateSelect(select, items, getValue, getLabel) {
  select.innerHTML = "";
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = getValue(item);
    option.textContent = getLabel(item);
    select.append(option);
  });
}

function goalFromState(currentLevel) {
  if (elements.targetMode.value === "level") {
    const level = clampNumber(elements.goalLevel.value, 1, MAX_SUPPORTED_LEVEL, Math.max(currentLevel, 91));
    const rank = currentRankThreshold(level);
    return {
      rank: `Level ${level}`,
      family: rank.family,
      level,
      isCustomLevel: true
    };
  }

  return RANK_THRESHOLDS.find((item) => item.rank === elements.goalSelect.value) ?? RANK_THRESHOLDS.at(-3);
}

function getActivityReward(type, difficulty) {
  const rewards = XP_DATA.labs[type];
  return rewards[difficulty] ?? rewards.medium ?? Object.values(rewards)[0];
}

function getActivityXp(type, reward) {
  return type === "machines" ? reward.total : reward.xp;
}

function getState() {
  const currentLevel = clampNumber(elements.currentLevel.value, 0, MAX_SUPPORTED_LEVEL, 1);
  const nextLevelXp = xpForNextLevel(currentLevel);
  const currentXp = clampNumber(elements.currentXp.value, 0, nextLevelXp - 1, 0);
  const goal = goalFromState(currentLevel);
  const activityGoal =
    RANK_THRESHOLDS.find((item) => item.rank === elements.activityGoalSelect.value) ?? goal;
  const activityType = elements.activityType.value === "challenges" ? "challenges" : "machines";
  const activityDifficulty = elements.activityDifficulty.value || "medium";
  const activityReward = getActivityReward(activityType, activityDifficulty);
  const xpGain = clampNumber(elements.xpGain.value, 0, 999999, 1000);

  return {
    currentLevel,
    nextLevelXp,
    currentXp,
    goal,
    activityGoal,
    activityType,
    activityDifficulty,
    activityReward,
    xpGain
  };
}

function syncInputs(state) {
  if (document.activeElement !== elements.currentLevel) {
    elements.currentLevel.value = state.currentLevel;
  }
  elements.currentXp.max = state.nextLevelXp - 1;
  if (document.activeElement !== elements.currentXp) {
    elements.currentXp.value = state.currentXp;
  }
  elements.xpGain.value = state.xpGain;
  elements.goalLevel.value = state.goal.isCustomLevel ? state.goal.level : elements.goalLevel.value;
  elements.goalRankField.hidden = state.goal.isCustomLevel;
  elements.goalLevelField.hidden = !state.goal.isCustomLevel;
}

function rankStateFor(rank, state) {
  const currentRank = currentRankThreshold(state.currentLevel);
  const nextRank = nextRankThreshold(state.currentLevel);

  if (rank.rank === currentRank.rank) {
    return "current";
  }

  if (state.currentLevel >= rank.level) {
    return "complete";
  }

  if (nextRank && rank.rank === nextRank.rank) {
    return "next";
  }

  return "locked";
}

function familyStateFor(tiers, state) {
  const currentRank = currentRankThreshold(state.currentLevel);
  const nextRank = nextRankThreshold(state.currentLevel);
  const firstTier = tiers[0];
  const finalTier = tiers.at(-1);

  if (currentRank.family === firstTier.family) {
    return "current";
  }

  if (state.currentLevel >= finalTier.level) {
    return "complete";
  }

  if (nextRank && nextRank.family === firstTier.family) {
    return "next";
  }

  return "locked";
}

function statusConfig(status) {
  const statuses = {
    complete: { icon: "", label: "COMPLETE" },
    current: { icon: "", label: "IN PROGRESS" },
    next: { icon: "", label: "NEXT LOCKED" },
    locked: { icon: "", label: "LOCKED" }
  };
  return statuses[status] ?? statuses.locked;
}

function renderRankProjection(state) {
  elements.rankProjection.innerHTML = "";

  RANK_FAMILIES.forEach((family) => {
    const tiers = RANK_THRESHOLDS.filter((rank) => rank.family === family);
    const firstTier = tiers[0];
    const finalTier = tiers.at(-1);
    const nextTier = tiers.find((rank) => state.currentLevel < rank.level);
    const completeFamily = state.currentLevel >= finalTier.level;
    const familyState = familyStateFor(tiers, state);
    const familyStatus = statusConfig(familyState);
    const summaryRemaining = xpRemainingToLevel(
      state.currentLevel,
      state.currentXp,
      nextTier?.level ?? finalTier.level
    );

    const details = document.createElement("details");
    details.className = `rank-group is-${familyState}`;
    details.open = state.goal.family === family;

    const status = completeFamily
      ? "Complete"
      : nextTier
        ? `${formatNumber(summaryRemaining)} XP to ${nextTier.rank}`
        : "Reached";

    details.innerHTML = `
      <summary>
        <div class="status-icon" aria-hidden="true">${familyStatus.icon}</div>
        <div class="rank-meta">
          <strong>${family}</strong>
          <span>${familyStatus.label} - ${status}</span>
        </div>
        <div class="pill">Level ${firstTier.level}-${finalTier.level}</div>
      </summary>
      <div class="tier-list"></div>
    `;

    const tierList = details.querySelector(".tier-list");
    tiers.forEach((rank) => {
      const remainingXp = xpRemainingToLevel(state.currentLevel, state.currentXp, rank.level);
      const tierState = rankStateFor(rank, state);
      const tierStatus = statusConfig(tierState);
      const row = document.createElement("div");
      row.className = `rank-row is-${tierState}`;
      row.innerHTML = `
        <div class="status-icon" aria-hidden="true">${tierStatus.icon}</div>
        <div class="rank-meta">
          <strong>${rank.rank}</strong>
          <span>${tierStatus.label}${remainingXp === 0 ? "" : ` - ${formatNumber(remainingXp)} XP remaining`}</span>
        </div>
        <div class="pill">Level ${rank.level}</div>
      `;
      tierList.append(row);
    });

    elements.rankProjection.append(details);
  });
}

function renderActivityEquivalency(state, remainingXp) {
  const activityXp = getActivityXp(state.activityType, state.activityReward);
  const completions = remainingXp === 0 ? 0 : Math.ceil(remainingXp / activityXp);
  const unit = state.activityType === "machines" ? "machines" : "challenges";

  elements.equivalencyBase.textContent = `For ${state.activityGoal.rank}`;
  elements.activityRewardLabel.textContent = state.activityReward.label;
  elements.activityCount.textContent = formatNumber(completions);
  elements.activityCountLabel.textContent = `estimated ${unit}`;
  elements.activityBreakdown.innerHTML = "";

  const rows = [
    { label: "Reward", value: `${formatNumber(activityXp)} XP` },
    { label: "Remaining", value: `${formatNumber(remainingXp)} XP` }
  ];

  if (state.activityType === "machines") {
    rows.push({
      label: "Machine split",
      value: `${formatNumber(state.activityReward.user)} user / ${formatNumber(state.activityReward.root)} root`
    });
  }

  rows.forEach((row) => {
    const item = document.createElement("div");
    item.className = "metric-row";
    item.innerHTML = `
      <span>${row.label}</span>
      <strong>${row.value}</strong>
    `;
    elements.activityBreakdown.append(item);
  });
}

function renderXpGainPreview(state) {
  const preview = applyXpGain(state.currentLevel, state.currentXp, state.xpGain);

  elements.xpGainLevel.textContent = `Level ${preview.level}`;
  elements.xpGainRank.textContent = rankForLevel(preview.level);
  elements.xpGainProgress.textContent = `${formatNumber(preview.xp)} / ${formatNumber(preview.nextLevelXp)} XP`;
}

function render() {
  const state = getState();
  syncInputs(state);

  const targetRemaining = xpRemainingToLevel(state.currentLevel, state.currentXp, state.goal.level);
  const activityRemaining = xpRemainingToLevel(state.currentLevel, state.currentXp, state.activityGoal.level);
  const progressPercent = Math.min(100, Math.max(0, (state.currentXp / state.nextLevelXp) * 100));

  elements.currentRank.textContent = rankForLevel(state.currentLevel);
  elements.targetRank.textContent = state.goal.rank;
  elements.targetRemainingXp.textContent = formatNumber(targetRemaining);
  elements.progressLabel.textContent = `${formatNumber(state.currentXp)} / ${formatNumber(state.nextLevelXp)} XP`;
  elements.levelRange.textContent = `Level ${state.currentLevel} → ${state.currentLevel + 1}`;
  elements.progressFill.style.width = `${progressPercent}%`;

  const progressTrack = elements.progressFill.parentElement;
  progressTrack.setAttribute("aria-valuenow", String(Math.round(progressPercent)));
  progressTrack.setAttribute(
    "aria-valuetext",
    `${formatNumber(state.currentXp)} of ${formatNumber(state.nextLevelXp)} XP`
  );

  renderXpGainPreview(state);
  renderRankProjection(state);
  renderActivityEquivalency(state, activityRemaining);
}

function syncActivityDifficultyOptions() {
  const current = elements.activityDifficulty.value || "medium";
  const rewards = XP_DATA.labs[elements.activityType.value];
  populateSelect(
    elements.activityDifficulty,
    DIFFICULTY_ORDER.filter((difficulty) => rewards[difficulty]).map((difficulty) => [difficulty, rewards[difficulty]]),
    ([difficulty]) => difficulty,
    ([, reward]) => reward.label.replace(" Machine", "").replace(" Challenge", "")
  );
  elements.activityDifficulty.value = rewards[current] ? current : "medium";
}

function bindEvents() {
  document.querySelectorAll("input, select").forEach((field) => {
    field.addEventListener("input", render);
    field.addEventListener("change", render);
  });

  elements.activityType.addEventListener("change", () => {
    syncActivityDifficultyOptions();
    render();
  });
}

populateSelect(elements.goalSelect, RANK_THRESHOLDS, (rank) => rank.rank, (rank) => `${rank.rank} - Level ${rank.level}`);
populateSelect(elements.activityGoalSelect, RANK_THRESHOLDS, (rank) => rank.rank, (rank) => `${rank.rank} - Level ${rank.level}`);
elements.goalSelect.value = "Grandmaster I";
elements.activityGoalSelect.value = "Grandmaster I";
elements.activityType.value = "machines";
syncActivityDifficultyOptions();
elements.activityDifficulty.value = "medium";
bindEvents();
render();
