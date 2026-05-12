# DIET

## Chapter 2 Quick Player Guide (Sampling Bias)

This chapter teaches one core idea:
A model can look good on small or biased training data, then fail in the real world.

### What You Should Do (Step by Step)

### 1) Start in Demo
- Open Chapter 2 and go to `02 · Demo`.
- Use the boundary sliders to separate the small training set (Region 1).
- Try to make training accuracy look high.

### 2) Trigger the Reveal
- Click `Deploy to Full City (1000 Points)`.
- Watch what changes when all regions appear.
- Observe how accuracy drops and errors increase.

### 3) Enter Investigate (3-Day Game)
- Move to `03 · Investigate`.
- You now have **3 days**, each day with a fixed budget.
- Goal: design better data collection before training.

### 4) For Each Day, Build Mission Plans
- Choose **zones** to search.
- Choose **population amount** (`100 / 500 / 1000`).
- If multiple zones are selected, set **distribution** across those zones.
- Distribution uses 10% increments and selected zones always sum to 100%.
- Choose **additional questions** (you can select multiple):
	- Daily Routine (useful context)
	- Phone Model (mostly noise)
	- Past Police Stops (bias risk)
- Add one or more missions until budget is used or strategy is complete.

### 5) Send Detective
- Click `Send Detective` to lock the day.
- Repeat planning on Day 2 and Day 3 using what you learned.

### 6) Train and Read Results
- After Day 3, train the model.
- In `04 · Results`, check:
	- accuracy by district
	- transfer to neighboring city
	- which districts were under-sampled

### 7) Improve Your Strategy
- Go back and try a new plan.
- Compare outcomes when you:
	- over-focus on one zone
	- spread sampling across zones
	- add useful vs noisy vs bias-prone questions

## Learning Outcome

By the end of Chapter 2, players should understand that:
- Data collection decisions shape model behavior.
- Better sampling strategy often matters more than model tuning.
- A model that scores well on narrow data can still be unfair and unsafe in deployment.