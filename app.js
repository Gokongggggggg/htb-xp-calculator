const XP_DATA = {
  academy: {
    fundamental: { label: "Fundamental", sectionXp: 10, questionXp: 20, pathBonus: 0 },
    easy: { label: "Easy", sectionXp: 15, questionXp: 30, pathBonus: 300 },
    medium: { label: "Medium", sectionXp: 20, questionXp: 40, pathBonus: 500 },
    hard: { label: "Hard", sectionXp: 40, questionXp: 60, pathBonus: 1000 }
  },
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

const elements = {
  currentLevel: document.querySelector("#currentLevel"),
  currentXp: document.querySelector("#currentXp"),
  goalSelect: document.querySelector("#goalSelect"),
  academyDifficulty: document.querySelector("#academyDifficulty"),
  academySections: document.querySelector("#academySections"),
  academyQuestions: document.querySelector("#academyQuestions"),
  academyPathBonus: document.querySelector("#academyPathBonus"),
  nextLevelXp: document.querySelector("#nextLevelXp"),
  currentRank: document.querySelector("#currentRank"),
  targetLevel: document.querySelector("#targetLevel"),
  targetRemainingXp: document.querySelector("#targetRemainingXp"),
  nextProgressPercent: document.querySelector("#nextProgressPercent"),
  progressLabel: document.querySelector("#progressLabel"),
  levelRange: document.querySelector("#levelRange"),
  progressFill: document.querySelector("#progressFill"),
  rankProjection: document.querySelector("#rankProjection"),
  machineEquivalency: document.querySelector("#machineEquivalency"),
  equivalencyBase: document.querySelector("#equivalencyBase"),
  goalName: document.querySelector("#goalName"),
  goalRequiredLevel: document.querySelector("#goalRequiredLevel"),
  goalCurrentLevel: document.querySelector("#goalCurrentLevel"),
  goalRemainingLevels: document.querySelector("#goalRemainingLevels"),
  goalEstimatedXp: document.querySelector("#goalEstimatedXp"),
  academyProjectionLabel: document.querySelector("#academyProjectionLabel"),
  academyProjectedXp: document.querySelector("#academyProjectedXp"),
  academyProjectedLevel: document.querySelector("#academyProjectedLevel"),
  academyProjectedRank: document.querySelector("#academyProjectedRank"),
  academyBonus: document.querySelector("#academyBonus")
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

function advanceLevel(currentLevel, currentXp, gainedXp) {
  let level = currentLevel;
  let progress = currentXp + gainedXp;

  while (progress >= xpForNextLevel(level)) {
    progress -= xpForNextLevel(level);
    level += 1;
  }

  return { level, progress };
}

function rankForLevel(level) {
  return RANK_THRESHOLDS.filter((rank) => level >= rank.level).at(-1)?.rank ?? "Unranked";
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

function getAcademyXp(state) {
  const reward = XP_DATA.academy[state.academyDifficulty];
  const bonus = state.academyPathBonus ? reward.pathBonus : 0;
  return {
    reward,
    bonus,
    total: state.academySections * reward.sectionXp + state.academyQuestions * reward.questionXp + bonus
  };
}

function getState() {
  const currentLevel = clampNumber(elements.currentLevel.value, 1, 140, 16);
  const nextLevelXp = xpForNextLevel(currentLevel);
  const currentXp = clampNumber(elements.currentXp.value, 0, nextLevelXp - 1, 0);
  const goal = RANK_THRESHOLDS.find((item) => item.rank === elements.goalSelect.value) ?? RANK_THRESHOLDS.at(-3);

  return {
    currentLevel,
    nextLevelXp,
    currentXp,
    goal,
    academyDifficulty: elements.academyDifficulty.value || "medium",
    academySections: clampNumber(elements.academySections.value, 0, 999, 0),
    academyQuestions: clampNumber(elements.academyQuestions.value, 0, 999, 0),
    academyPathBonus: elements.academyPathBonus.checked
  };
}

function syncInputs(state) {
  elements.currentLevel.value = state.currentLevel;
  elements.currentXp.max = state.nextLevelXp - 1;
  elements.currentXp.value = state.currentXp;
  elements.academySections.value = state.academySections;
  elements.academyQuestions.value = state.academyQuestions;
}

function renderRankProjection(state) {
  elements.rankProjection.innerHTML = "";

  RANK_FAMILIES.forEach((family) => {
    const tiers = RANK_THRESHOLDS.filter((rank) => rank.family === family);
    const firstTier = tiers[0];
    const finalTier = tiers.at(-1);
    const nextTier = tiers.find((rank) => state.currentLevel < rank.level);
    const reachedFamily = state.currentLevel >= firstTier.level;
    const completeFamily = state.currentLevel >= finalTier.level;
    const summaryRemaining = xpRemainingToLevel(
      state.currentLevel,
      state.currentXp,
      nextTier?.level ?? finalTier.level
    );

    const details = document.createElement("details");
    details.className = `rank-group${reachedFamily ? " is-reached" : ""}`;
    details.open = state.goal.family === family;

    const status = completeFamily
      ? "Complete"
      : nextTier
        ? `${formatNumber(summaryRemaining)} XP to ${nextTier.rank}`
        : "Reached";

    details.innerHTML = `
      <summary>
        <div class="rank-meta">
          <strong>${family}</strong>
          <span>${status}</span>
        </div>
        <div class="pill">Level ${firstTier.level}-${finalTier.level}</div>
      </summary>
      <div class="tier-list"></div>
    `;

    const tierList = details.querySelector(".tier-list");
    tiers.forEach((rank) => {
      const remainingXp = xpRemainingToLevel(state.currentLevel, state.currentXp, rank.level);
      const row = document.createElement("div");
      row.className = `rank-row${state.currentLevel >= rank.level ? " is-reached" : ""}`;
      row.innerHTML = `
        <div class="rank-meta">
          <strong>${rank.rank}</strong>
          <span>${remainingXp === 0 ? "Reached" : `${formatNumber(remainingXp)} XP remaining`}</span>
        </div>
        <div class="pill">Level ${rank.level}</div>
      `;
      tierList.append(row);
    });

    elements.rankProjection.append(details);
  });
}

function renderActivityEquivalency(remainingXp) {
  const rows = [
    ...Object.values(XP_DATA.labs.machines).map((item) => ({
      label: item.label,
      value: Math.ceil(remainingXp / item.total),
      meta: `${formatNumber(item.total)} XP total`
    })),
    ...Object.values(XP_DATA.labs.challenges).map((item) => ({
      label: item.label,
      value: Math.ceil(remainingXp / item.xp),
      meta: `${formatNumber(item.xp)} XP`
    }))
  ];

  elements.machineEquivalency.innerHTML = "";
  rows.forEach((row) => {
    const item = document.createElement("div");
    item.className = "metric-row";
    item.innerHTML = `
      <div class="metric-meta">
        <strong>${row.label}</strong>
        <span>${row.meta}</span>
      </div>
      <strong>~ ${formatNumber(row.value)}</strong>
    `;
    elements.machineEquivalency.append(item);
  });
}

function renderAcademyProjection(state) {
  const academy = getAcademyXp(state);
  const projected = advanceLevel(state.currentLevel, state.currentXp, academy.total);

  elements.academyProjectionLabel.textContent = `${academy.reward.label} module`;
  elements.academyProjectedXp.textContent = `${formatNumber(academy.total)} XP`;
  elements.academyProjectedLevel.textContent = `${state.currentLevel} -> ${projected.level}`;
  elements.academyProjectedRank.textContent = rankForLevel(projected.level);
  elements.academyBonus.textContent = `${formatNumber(academy.bonus)} XP`;
}

function render() {
  const state = getState();
  syncInputs(state);

  const targetRemaining = xpRemainingToLevel(state.currentLevel, state.currentXp, state.goal.level);
  const progressPercent = Math.min(100, Math.max(0, (state.currentXp / state.nextLevelXp) * 100));

  elements.nextLevelXp.textContent = `${formatNumber(state.nextLevelXp)} XP`;
  elements.currentRank.textContent = rankForLevel(state.currentLevel);
  elements.targetLevel.textContent = state.goal.level;
  elements.targetRemainingXp.textContent = formatNumber(targetRemaining);
  elements.nextProgressPercent.textContent = `${Math.round(progressPercent)}%`;
  elements.progressLabel.textContent = `${formatNumber(state.currentXp)} / ${formatNumber(state.nextLevelXp)} XP`;
  elements.levelRange.textContent = `Level ${state.currentLevel} -> ${state.currentLevel + 1}`;
  elements.progressFill.style.width = `${progressPercent}%`;

  renderRankProjection(state);
  renderActivityEquivalency(targetRemaining);
  renderAcademyProjection(state);

  elements.equivalencyBase.textContent = `For ${state.goal.rank}`;
  elements.goalName.textContent = state.goal.rank;
  elements.goalRequiredLevel.textContent = state.goal.level;
  elements.goalCurrentLevel.textContent = state.currentLevel;
  elements.goalRemainingLevels.textContent = Math.max(0, state.goal.level - state.currentLevel);
  elements.goalEstimatedXp.textContent = `${formatNumber(targetRemaining)} XP`;
}

function bindEvents() {
  document.querySelectorAll("input, select").forEach((field) => {
    field.addEventListener("input", render);
    field.addEventListener("change", render);
  });
}

populateSelect(elements.goalSelect, RANK_THRESHOLDS, (rank) => rank.rank, (rank) => `${rank.rank} - Level ${rank.level}`);
populateSelect(
  elements.academyDifficulty,
  Object.entries(XP_DATA.academy),
  ([key]) => key,
  ([, value]) => value.label
);
elements.goalSelect.value = "Grandmaster I";
elements.academyDifficulty.value = "medium";
bindEvents();
render();
