import zone1icon from "./Zone/zone1icon.png";
import zone1image from "./Zone/zone1image.png";
import zone2icon from "./Zone/zone2icon.png";
import zone2image from "./Zone/zone2image.png";
import zone3icon from "./Zone/zone3icon.png";
import zone3image from "./Zone/zone3image.png";
import zone4icon from "./Zone/zone4icon.png";
import zone4image from "./Zone/zone4image.png";

import Scene1 from "./Scene/Scene1.png";
import Scene2 from "./Scene/Scene2.png";
import Scene3 from "./Scene/Scene3.png";
import Scene4 from "./Scene/Scene4.png";
import Scene5 from "./Scene/Scene5.png";
import Scene6 from "./Scene/Scene6.png";
import Scene7 from "./Scene/Scene7.png";
import Scene8 from "./Scene/Scene8.png";
import Scene9 from "./Scene/Scene9.png";

import budgetIcon from "./Budget.png";
import spentIcon from "./Spend.png";
import draftIcon from "./Draft.png";
import p100 from "./P100.png";
import p500 from "./P500.png";
import p1000 from "./P1000.png";
import routineIcon from "./routine.png";
import phoneIcon from "./phone.png";
import policeIcon from "./police.png";
import chapter1CaseRoom from "./Chapter1/chapter1_case_room.png";

export const ZONE_VISUALS = [
  { icon: zone1icon, image: zone1image },
  { icon: zone2icon, image: zone2image },
  { icon: zone3icon, image: zone3image },
  { icon: zone4icon, image: zone4image },
] as const;

export const SCENE_IMAGES = [
  Scene1,
  Scene2,
  Scene3,
  Scene4,
  Scene5,
  Scene6,
  Scene7,
  Scene8,
  Scene9,
] as const;

export const BUDGET_VISUALS = {
  budget: budgetIcon,
  spent: spentIcon,
  draft: draftIcon,
} as const;

export const POPULATION_IMAGES = {
  100: p100,
  500: p500,
  1000: p1000,
} as const;

export const QUESTION_IMAGES = {
  "daily-routine": routineIcon,
  "phone-model": phoneIcon,
  "past-police-stops": policeIcon,
} as const;

export const CHAPTER1_BACKGROUNDS = {
  caseRoom: chapter1CaseRoom,
} as const;
