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

const elements = {
  currentLevel: document.querySelector("#currentLevel"),
  currentXp: document.querySelector("#currentXp"),
  goalSelect: document.querySelector("#goalSelect"),
  activityGoalSelect: document.querySelector("#activityGoalSelect"),
  activityType: document.querySelector("#activityType"),
  activityDifficulty: document.querySelector("#activityDifficulty"),
  nextLevelXp: document.querySelector("#nextLevelXp"),
  currentRank: document.querySelector("#currentRank"),
  targetRank: document.querySelector("#targetRank"),
  targetRemainingXp: document.querySelector("#targetRemainingXp"),
  progressLabel: document.querySelector("#progressLabel"),
  levelRange: document.querySelector("#levelRange"),
  progressFill: document.querySelector("#progressFill"),
  rankProjection: document.querySelector("#rankProjection"),
  equivalencyBase: document.querySelector("#equivalencyBase"),
  activityRewardLabel: document.querySelector("#activityRewardLabel"),
  activityCount: document.querySelector("#activityCount"),
  activityCountLabel: document.querySelector("#activityCountLabel"),
  activityBreakdown: document.querySelector("#activityBreakdown")
};

function xpForNextLevel(level) {
  return 422 + (level - 16) * 22;
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

function getActivityReward(type, difficulty) {
  const rewards = XP_DATA.labs[type];
  return rewards[difficulty] ?? rewards.medium ?? Object.values(rewards)[0];
}

function getActivityXp(type, reward) {
  return type === "machines" ? reward.total : reward.xp;
}

function getState() {
  const currentLevel = clampNumber(elements.currentLevel.value, 1, 140, 16);
  const nextLevelXp = xpForNextLevel(currentLevel);
  const currentXp = clampNumber(elements.currentXp.value, 0, nextLevelXp - 1, 0);
  const goal = RANK_THRESHOLDS.find((item) => item.rank === elements.goalSelect.value) ?? RANK_THRESHOLDS.at(-3);
  const activityGoal =
    RANK_THRESHOLDS.find((item) => item.rank === elements.activityGoalSelect.value) ?? goal;
  const activityType = elements.activityType.value === "challenges" ? "challenges" : "machines";
  const activityDifficulty = elements.activityDifficulty.value || "medium";
  const activityReward = getActivityReward(activityType, activityDifficulty);

  return {
    currentLevel,
    nextLevelXp,
    currentXp,
    goal,
    activityGoal,
    activityType,
    activityDifficulty,
    activityReward
  };
}

function syncInputs(state) {
  elements.currentLevel.value = state.currentLevel;
  elements.currentXp.max = state.nextLevelXp - 1;
  elements.currentXp.value = state.currentXp;
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
    complete: { icon: "OK", label: "Complete" },
    current: { icon: "GO", label: "In progress" },
    next: { icon: "LOCK", label: "Next locked" },
    locked: { icon: "LOCK", label: "Locked" }
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

function render() {
  const state = getState();
  syncInputs(state);

  const targetRemaining = xpRemainingToLevel(state.currentLevel, state.currentXp, state.goal.level);
  const activityRemaining = xpRemainingToLevel(state.currentLevel, state.currentXp, state.activityGoal.level);
  const progressPercent = Math.min(100, Math.max(0, (state.currentXp / state.nextLevelXp) * 100));

  elements.nextLevelXp.textContent = `${formatNumber(state.nextLevelXp)} XP`;
  elements.currentRank.textContent = rankForLevel(state.currentLevel);
  elements.targetRank.textContent = state.goal.rank;
  elements.targetRemainingXp.textContent = formatNumber(targetRemaining);
  elements.progressLabel.textContent = `${formatNumber(state.currentXp)} / ${formatNumber(state.nextLevelXp)} XP`;
  elements.levelRange.textContent = `Level ${state.currentLevel} -> ${state.currentLevel + 1}`;
  elements.progressFill.style.width = `${progressPercent}%`;

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
