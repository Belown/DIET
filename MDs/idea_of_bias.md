# AI Fairness Prototype: Theoretical Framing & Narrative Integration

## 1. Redefining "Incomplete Data" (The Socio-Technical Shift)

To teach CS students about systemic bias, the concept of "incomplete data" must shift from technical missing values (e.g., `NaN` in a database) to missing real-world context.

* **Missing Context (The Proxy Problem):** ML models rarely measure the "Ground Truth" (e.g., actual future job performance). They use proxies (e.g., "Years of Experience"). If a dataset perfectly captures a historically biased proxy, optimizing for Overall Accuracy mathematically reinforces that bias. The data isn't missing; it perfectly captures an inequitable world.
* **Missing Not At Random (MNAR):** In human data, the absence of a metric is often correlated with a protected class. For example, a missing "Portfolio Score" might reflect a candidate needing to work a second job during university rather than lacking skill. Penalizing missing data disproportionately harms these groups.
* **Survivorship Bias:** Historical data only contains performance metrics for people the company actually hired. The model confuses a *lack of historical opportunity* for minority groups with a *lack of inherent capability*.

## 2. Interactive Parameters (The CV Checker)

The parameters chosen for the simulation should highlight the proxy and MNAR problems:

* **X-Axis (Technical Score):** Mostly objective, but variance exists due to unequal access to standard test-prep resources.
* **Y-Axis (Years of Continuous Experience):** Highly vulnerable to systemic bias. Group B is shifted downward due to historical hurdles or systemic career breaks.
* **Z-Axis (Portfolio / Extra Projects):** The "Hidden Feature." A strong indicator of skill, but heavily skewed by socioeconomic status and free time.

## 3. Mechanics of Mitigation

Players must learn that a single standard does not mean equal opportunity.

* **Group-Specific Thresholding:** Players learn to draw complex, step-wise boundaries (or distinct curves) that lower the threshold for historically biased proxies (like "Experience") for Group B, while relying on other features to maintain accuracy.
* **Feature Intersection:** Unlocking the 3D space teaches that evaluating $(X \text{ AND } Y \text{ AND } Z)$ simultaneously creates a manifold that identifies great candidates who might fall short on one historically biased axis.

## 4. Narrative Integration of Equal Opportunity (TPR Parity)

Equal Opportunity ($|TPR_{Group A} - TPR_{Group B}| \le \epsilon$) must be framed as a narrative consequence, not just a mathematical output.

* **Redefining TPR:** Frame True Positive Rate as the **"Qualified Candidate Discovery Rate."** It guarantees that if a candidate is genuinely qualified, their probability of getting an interview is identical regardless of their demographic group.
* **The "Ethics Audit" (The Antagonist):** The player's boss initially demands >80% Overall Accuracy. However, when the player submits their 2D boundary, an Ethics Auditor steps in, calculates the TPR, and blocks deployment if the model disproportionately rejects qualified minority candidates.
* **The Visual "Aha!" Moment:** When the audit fails, the UI illuminates the False Negatives for Group B—the highly qualified candidates clustered just below the player's simplistic 2D line. This visually proves that drawing a single line mathematically engineers a discriminatory barrier, forcing the player to unlock new dimensions to win.
