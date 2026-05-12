# Activity description

## Context
The blog/game is about how AI bias appears when a system has to choose one definition of fairness, even though different fairness metrics can conflict with each other. In recidivism prediction, this tension is especially visible because historical criminal-justice data can encode past discrimination and then reproduce it in future decisions.

The central question for users is: what counts as “fair” here? For example, a model might aim for equal recidivism rates across groups, equal error rates, or equal treatment of similar individuals, but those goals do not always align.

## Preliminary : bias in our head
Goal : Highlight the bias we carry in our mind from our experience and why we need AI in ethical decision.

Activity : The user will have the mission to classify profiles as potential recidivist in a ranking between 1 to 10 (maybe only low-medium-high, to simplify interface, since user has to decide quickly?). Each profile can display visible markers such as ethnicity, socio-economic background, and the charge the person faced.The user will have only few seconds per profile to make the decision. This design forces the user to use their instinct, which is controlled by biases from our experience. We then reason about the importance to integrate an AI system for efficient ethical decision-making.

Note: A stronger version of the activity could deliberately structure the choices around tradeoffs, so that no option is perfectly neutral. For example, one scenario could pit people from disadvantaged neighborhoods or unstable family situations against people who committed similar offenses under different conditions. The point is not to “trap” users, but to show that justice often requires selecting one definition of fairness over another.

## Part 1 : Fairness definition
Activity : Choose a fairness definition, ideally multiple choice presentation (for instance,choose between equal recidivism rates across groups, equal error rates, or equal treatment of similar individuals). This step is meant to have the user reflect about the proble, before we give them a solution. 

Note: Ultimately, we will go for the definition of fairness that works from the sentencer's perspective first (Scores map to equal probability in actual re-offending among both blacks and whites (race does not matter)).

## Part 2 : Judge/sentencer pov
Here, the consequences are shown from the judge’s or sentencer’s point of view. From this perspective, the algorithm may look fair because it provides consistent risk estimates and helps standardize decisions across cases.
This section should emphasize the practical appeal of the system: it reduces uncertainty, appears objective, and can support faster decisions. The key idea is that fairness can seem acceptable when the system is evaluated from the side of the person making the decision

## Part 3 : Defendant pov
Switch to the defendant’s perspective, where the same system looks unfair.s

## Part 4 : mitigations and limitations
Mitigation techniques for bias in data + tension between fairness definitions and limit of fairness metrics