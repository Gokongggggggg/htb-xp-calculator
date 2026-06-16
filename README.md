# HTB XP Calculator

Static MVP for calculating Hack The Box XP progression, detailed rank tiers, and Labs activity equivalency up to Grandmaster.

## Run

Open `index.html` in a browser.

## XP Model

The calculator uses the current community-derived XP model:

```text
XP required for next level = 422 + ((currentLevel - 16) * 22)
```

This is marked as community-derived until more data points are collected.

## Rank Thresholds

Rank tiers follow HTB threshold data, where `I` is the lowest tier for each rank family:

```text
Beginner I: 1
Beginner II: 6
Beginner III: 11
Apprentice I: 16
Apprentice II: 21
Apprentice III: 26
Skilled I: 31
Skilled II: 36
Skilled III: 41
Professional I: 46
Professional II: 51
Professional III: 56
Master I: 61
Master II: 66
Master III: 71
Prodigy I: 76
Prodigy II: 81
Prodigy III: 86
Grandmaster I: 91
Grandmaster II: 100
Grandmaster III: 106
```

## XP Rewards

Labs machine and challenge rewards are encoded directly from the HTB XP data knowledge base in `app.js`.
