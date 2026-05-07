import { SCENE_AUDIO } from "../../../../../assets/audio/audio";
import { SCENE_IMAGES } from "../../../../../assets/image/image";

export type StoryScene = {
  image: string;
  title: string;
  text: string;
  audio?: string;
};

export const STORY_SCENES = [
  {
    image: SCENE_IMAGES[0],
    audio: SCENE_AUDIO[0],
    title: "Scene 1",
    text: "In the future city of Nova, humanity has handed its hardest choices to AI. It decides who receives a loan, who gets a job, who enters school, and who is found guilty. People believe it never gets tired, never takes sides, and is never influenced by emotion. In this city, AI is known as 'the fairest judge'.",
  },
  {
    image: SCENE_IMAGES[1],
    audio: SCENE_AUDIO[1],
    title: "Scene 2",
    text: "In one quiet corner of the city, a private detective lives a peaceful life. By his side are only a loyal dog and a young apprentice. They do not have a luxurious office or world-shaking cases. But in an age ruled by machines, this small home still holds a little warmth.",
  },
  {
    image: SCENE_IMAGES[2],
    audio: SCENE_AUDIO[2],
    title: "Scene 3",
    text: "Until one ordinary morning, the doorbell rings. The sound is short and cold, as if fate itself is knocking. Police officers are standing outside. They offer little explanation and say only one thing: the apprentice has been accused of helping steal confidential government documents.",
  },
  {
    image: SCENE_IMAGES[3],
    audio: SCENE_AUDIO[3],
    title: "Scene 4",
    text: "The apprentice says he knows nothing. A stranger simply gave him a little money and asked him to slip a small device into a businessman's pocket. He thought it was just a strange errand, a harmless little task. But he did not know he had already been pulled into a much larger conspiracy.",
  },
  {
    image: SCENE_IMAGES[4],
    audio: SCENE_AUDIO[4],
    title: "Scene 5",
    text: "The AI does not see his panic. It does not see that he was used, nor the truth hidden behind the incident. It sees only data: his background, his neighborhood, and people from similar past cases. Then the system delivers a cold conclusion: High risk.",
  },
  {
    image: SCENE_IMAGES[5],
    audio: SCENE_AUDIO[5],
    title: "Scene 6",
    text: "In court, the detective desperately tries to explain. He presents evidence, tells the story, and tries to make people see what happened. But before the judge, a human voice seems too slow, too fragile. The AI's judgment is clean, fast, and certain. At last, the gavel falls. Not because the truth has been seen, but because the machine has made its decision.",
  },
  {
    image: SCENE_IMAGES[6],
    audio: SCENE_AUDIO[6],
    title: "Scene 7",
    text: "The days that follow become long and silent. The case files pile higher on the desk, and the clues on the wall grow more tangled. Every page points to doubt. Every clue proves that some truth is still unseen. But the city has already moved on. Only the detective remains trapped in that day, unable to move forward.",
  },
  {
    image: SCENE_IMAGES[7],
    audio: SCENE_AUDIO[7],
    title: "Scene 8",
    text: "Just as he is about to give up, a stranger appears at the door. He carries a machine that should not exist, and a hope that sounds almost impossible. 'I cannot change the verdict now,' he says. 'But I can send you back to before it all happened.' Back to before the AI was deployed. Back to before bias became a verdict. Back to the moment when the future can still be changed.",
  },
  {
    image: SCENE_IMAGES[8],
    audio: undefined,
    title: "Scene 9",
    text: "",
  },
] as const satisfies readonly StoryScene[];
