# Preparation

## Target Audience

- Choise: University student majoring in Computer Science, specifically those taking introductory Machine learning or Data Science courses.
- Justification: CS student are taught to optimize for overall accuracy, often treating models as purely mathematical constructs. Al literacy for this group must focus on thesocio-technical reality: mathematical design choices have direct, uneven impacts on different human demographics.

## Learning Objectives

- Concept: Algorithmic Bias / The Fairness-Accuracy Tradeoff.
- Metirc we want to use
  - $|TPR_{Group A} - TPR_{Group B}| \le \epsilon$
  - Overall Accuracy
- Measurable Goal 1: Users will be able to define and mathematically differentiate between "Overall Accuracy" and "Equal Opportunity" (equal True Positive Rates across protected groups).
- Measurable Goal 2: Users will demonstrate that optimizing a model solely for overall accuracy can degrade the TPR of minority groups, and learn how to implement group-specific thresholds to correct it.

## Prototype Desisn

- Format: A web-based interactive "ML Pipeline & Visual Canvas" simulation.
- Core Interaction: The user plays an ML Engineer tasked with building an automated CV-review model. They interact through a multi-layered UI:
  - Data Distribution Inspector: When the user clicks the Dataset node, a visualization pops up showing the distribution of the data across different demographic groups. This explicitly highlights the imperfections and historical skew of the raw data. Built-in analytical warnings flag that the dataset is imbalanced and caution the user that training blindly on this data will likely lead to inequity.
  - The Boundary Canvas (Dimensional Unlocking): Clicking the Classifier node opens a multi-step visual canvas.
    - Phase 1 (The Primary Bias): The user sees a 2D scatter plot (e.g., X-axis: Technical Score, Y-axis: Continuous Experience). Group A and Group B are plotted, with Group B shifted slightly downward to represent preexisting bias. The user physically decide a decision boundary curve by tuning the paramter.
    - Phase 2 (The Hidden Feature): To fix the inevitable fairness violation, the user unlocks a third feature (e.g., Z-axis: Portfolio Score) and decide a second 2D boundary curve on this new metric.
    - Phase 3 (The 3D Synthesis): The system automatically extrudes and intersects the user's two 2D curves, morphing the UI into a rotatable 3D space. The resulting 3D landscape is their true, multi-dimensional decision manifold.
- In order to avoid student have impression that "more features = fair", we might introduce new samples on the run to actually reveal the bias, that might exist in the data.
- The Hook: The user's goal is to solve a specific puzzle: achieve an Overall Accuracy of >80% while passing the Equal Opportunity Audit (keeping the True Positive Rate difference between Group A and Group B under 5%). If they draw a single 2D line to maximize accuracy, the Evaluation node reveals they have failed the audit by disproportionately cutting off qualified minority candidates. To win, they are forced to use the "Dimensional Unlocking" mechanic to build a complex 3D boundary. This viscerally proves that relying on simplistic, low-dimensional thresholds mathematically enforces inequality, and that true fairness often requires evaluating the intersection of multiple features.

## Evalution Plan

- Participants: Minimum 5 CS students who have taken or are taking an ML-related course.
- Procedure: TBD.

## Open Questions

- What are the parameter we are going to pick during the classification? (let's saying now we are going to design a CV checker, what are the main parameter we want? "Years of Experience", "Technical Score", "Portfolio", etc.)
- Since the users need to draw better "curve" during the interaction, so they have to know technique of mitigate these bias. What are the possible ways to solve it?
