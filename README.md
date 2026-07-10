# HTB XP Calculator

A free, browser-based Hack The Box XP calculator for estimating level progress, remaining XP, target ranks, and machine or challenge completion equivalents.

## Live Demo

https://gokongggggggg.github.io/htb-xp-calculator/

## Features

- Calculate remaining XP to a target HTB rank
- Calculate remaining XP to a custom target level
- Preview your level and rank after gaining additional XP
- View detailed rank progression from Beginner to Grandmaster
- Estimate equivalent machine completions by difficulty
- Estimate equivalent challenge completions by difficulty
- Responsive static interface with no backend required

## How to Use

1. Enter your current HTB level.
2. Enter your current XP progress toward the next level.
3. Choose a target rank or target level.
4. Review the estimated remaining XP.
5. Use the Activity Equivalency section to compare the target against machine or challenge completions.

## Run Locally

Clone the repository:

```bash
git clone git@github.com:Gokongggggggg/htb-xp-calculator.git
cd htb-xp-calculator
```

Then open `index.html` in a browser.

No build step, package manager, or backend is required.

## Project Structure

```text
htb-xp-calculator/
├── index.html
├── styles.css
├── app.js
└── README.md
```

## XP Model

The calculator currently uses this community-derived level progression model:

```text
XP required for next level = 423 + ((currentLevel - 17) * 22)
```

This model remains marked as community-derived until more verified HTB data points are collected.

## Rank Thresholds

Rank tiers currently follow these level thresholds. Tier `I` is the lowest tier in each rank family.

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

The current Labs reward values are defined directly in `app.js`.

### Machines

| Difficulty | User XP | Root XP | Total XP |
|---|---:|---:|---:|
| Very Easy | 100 | 150 | 250 |
| Easy | 200 | 250 | 450 |
| Medium | 300 | 350 | 650 |
| Hard | 400 | 450 | 850 |
| Insane | 500 | 550 | 1,050 |

### Challenges

| Difficulty | XP |
|---|---:|
| Very Easy | 100 |
| Easy | 200 |
| Medium | 300 |
| Hard | 400 |
| Insane | 500 |

## Accuracy and Limitations

This project is an independent community tool.

The XP formula, rank thresholds, and reward values may become inaccurate if Hack The Box changes its progression system. Results should be treated as estimates rather than official platform data.

## Disclaimer

This project is not affiliated with, endorsed by, or officially connected to Hack The Box.

Hack The Box and HTB are trademarks of their respective owner.

## Contributing

Corrections and verified XP data points are welcome.

Open an issue or submit a pull request with:

- the affected level, rank, or activity
- the expected XP value
- supporting evidence or reproduction steps

## License

No license has been added yet.
