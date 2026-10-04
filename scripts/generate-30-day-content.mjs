import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const unitDirs = (await readdir(join(root, "content/hsk1"), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory() && entry.name.startsWith("unit-"));
const bank = new Map();
for (const dir of unitDirs) {
  const files = await readdir(join(root, "content/hsk1", dir.name));
  for (const file of files.filter((name) => name.endsWith(".json"))) {
    const lesson = JSON.parse(await readFile(join(root, "content/hsk1", dir.name, file), "utf8"));
    for (const item of lesson.vocabulary) if (!bank.has(item.hanzi)) bank.set(item.hanzi, item);
  }
}

const examples = {
  "好": ["hǎo", "good; well", "adjective", "我很好。", "Wǒ hěn hǎo.", "I am well."],
  "吗": ["ma", "yes/no question particle", "particle", "你好吗？", "Nǐ hǎo ma?", "How are you?"],
  "呢": ["ne", "and…? (question particle)", "particle", "你呢？", "Nǐ ne?", "And you?"],
  "我": ["wǒ", "I; me", "pronoun", "我是学生。", "Wǒ shì xuésheng.", "I am a student."],
  "你": ["nǐ", "you", "pronoun", "你是老师吗？", "Nǐ shì lǎoshī ma?", "Are you a teacher?"],
  "他": ["tā", "he; him", "pronoun", "他是我的朋友。", "Tā shì wǒ de péngyou.", "He is my friend."],
  "她": ["tā", "she; her", "pronoun", "她是学生。", "Tā shì xuésheng.", "She is a student."],
  "我们": ["wǒmen", "we; us", "pronoun", "我们学习汉语。", "Wǒmen xuéxí Hànyǔ.", "We study Mandarin."],
  "他们": ["tāmen", "they; them", "pronoun", "他们是我的朋友。", "Tāmen shì wǒ de péngyou.", "They are my friends."],
  "叫": ["jiào", "to be called; to call", "verb", "我叫安娜。", "Wǒ jiào Ānnà.", "My name is Anna."],
  "名字": ["míngzi", "name", "noun", "你的名字是什么？", "Nǐ de míngzi shì shénme?", "What is your name?"],
  "什么": ["shénme", "what", "question word", "你叫什么名字？", "Nǐ jiào shénme míngzi?", "What is your name?"],
  "朋友": ["péngyou", "friend", "noun", "安娜是我的朋友。", "Ānnà shì wǒ de péngyou.", "Anna is my friend."],
  "认识": ["rènshi", "to know; to meet", "verb", "很高兴认识你。", "Hěn gāoxìng rènshi nǐ.", "Nice to meet you."],
  "中国": ["Zhōngguó", "China", "proper noun", "我住在中国。", "Wǒ zhù zài Zhōngguó.", "I live in China."],
  "美国": ["Měiguó", "the United States", "proper noun", "我朋友住在美国。", "Wǒ péngyou zhù zài Měiguó.", "My friend lives in the United States."],
  "英国": ["Yīngguó", "the United Kingdom", "proper noun", "他住在英国。", "Tā zhù zài Yīngguó.", "He lives in the United Kingdom."],
  "学生": ["xuésheng", "student", "noun", "她是学生。", "Tā shì xuésheng.", "She is a student."],
  "老师": ["lǎoshī", "teacher", "noun", "老师说汉语。", "Lǎoshī shuō Hànyǔ.", "The teacher speaks Mandarin."],
  "学习": ["xuéxí", "to study; to learn", "verb", "我学习中文。", "Wǒ xuéxí Zhōngwén.", "I study Chinese."],
  "说": ["shuō", "to speak; to say", "verb", "我说汉语。", "Wǒ shuō Hànyǔ.", "I speak Mandarin."],
  "是": ["shì", "to be", "verb", "我是学生。", "Wǒ shì xuésheng.", "I am a student."],
  "的": ["de", "possessive particle", "particle", "这是我的书。", "Zhè shì wǒ de shū.", "This is my book."],
  "家": ["jiā", "home; family", "noun", "我晚上回家。", "Wǒ wǎnshang huí jiā.", "I go home in the evening."],
  "这": ["zhè", "this", "demonstrative", "这是我的书。", "Zhè shì wǒ de shū.", "This is my book."],
  "那": ["nà", "that", "demonstrative", "那是学校。", "Nà shì xuéxiào.", "That is a school."],
  "哪": ["nǎ", "which", "question word", "你是哪国人？", "Nǐ shì nǎ guó rén?", "Which country are you from?"],
  "哪儿": ["nǎr", "where", "question word", "你去哪儿？", "Nǐ qù nǎr?", "Where are you going?"],
  "这里": ["zhèlǐ", "here", "place word", "老师在这里。", "Lǎoshī zài zhèlǐ.", "The teacher is here."],
  "一": ["yī", "one", "number", "我有一个苹果。", "Wǒ yǒu yí ge píngguǒ.", "I have one apple."],
  "二": ["èr", "two (in counting)", "number", "星期二我去学校。", "Xīngqī'èr wǒ qù xuéxiào.", "I go to school on Tuesday."],
  "三": ["sān", "three", "number", "三个人在家。", "Sān ge rén zài jiā.", "Three people are at home."],
  "四": ["sì", "four", "number", "四点我回家。", "Sì diǎn wǒ huí jiā.", "I go home at four."],
  "五": ["wǔ", "five", "number", "我有五个苹果。", "Wǒ yǒu wǔ ge píngguǒ.", "I have five apples."],
  "六": ["liù", "six", "number", "六点我们吃饭。", "Liù diǎn wǒmen chī fàn.", "We eat at six."],
  "七": ["qī", "seven", "number", "现在七点。", "Xiànzài qī diǎn.", "It is seven o'clock now."],
  "八": ["bā", "eight", "number", "八点我学习。", "Bā diǎn wǒ xuéxí.", "I study at eight."],
  "九": ["jiǔ", "nine", "number", "九点我回家。", "Jiǔ diǎn wǒ huí jiā.", "I go home at nine."],
  "十": ["shí", "ten", "number", "我十岁。", "Wǒ shí suì.", "I am ten years old."],
  "零": ["líng", "zero", "number", "现在十点零五分。", "Xiànzài shí diǎn líng wǔ fēn.", "It is 10:05 now."],
  "两": ["liǎng", "two (before a measure word)", "number", "我要两个苹果。", "Wǒ yào liǎng ge píngguǒ.", "I want two apples."],
  "几": ["jǐ", "how many; a few", "question word", "你几岁？", "Nǐ jǐ suì?", "How old are you?"],
  "岁": ["suì", "years old", "measure word", "我十岁。", "Wǒ shí suì.", "I am ten years old."],
  "多少": ["duōshao", "how many; how much", "question word", "这个苹果多少钱？", "Zhège píngguǒ duōshao qián?", "How much is this apple?"],
  "个": ["gè", "general measure word", "measure word", "我有一个朋友。", "Wǒ yǒu yí ge péngyou.", "I have one friend."],
  "今天": ["jīntiān", "today", "time word", "今天天气很好。", "Jīntiān tiānqì hěn hǎo.", "The weather is nice today."],
  "明天": ["míngtiān", "tomorrow", "time word", "明天我去学校。", "Míngtiān wǒ qù xuéxiào.", "I am going to school tomorrow."],
  "昨天": ["zuótiān", "yesterday", "time word", "昨天我在家。", "Zuótiān wǒ zài jiā.", "I was at home yesterday."],
  "现在": ["xiànzài", "now", "time word", "现在几点？", "Xiànzài jǐ diǎn?", "What time is it now?"],
  "点": ["diǎn", "o'clock; point", "time word", "现在三点。", "Xiànzài sān diǎn.", "It is three o'clock now."],
  "分钟": ["fēnzhōng", "minute", "time word", "我等五分钟。", "Wǒ děng wǔ fēnzhōng.", "I will wait five minutes."],
  "年": ["nián", "year", "time word", "我今年十岁。", "Wǒ jīnnián shí suì.", "I am ten years old this year."],
  "月": ["yuè", "month", "time word", "我十月去中国。", "Wǒ shí yuè qù Zhōngguó.", "I am going to China in October."],
  "爸爸": ["bàba", "father; dad", "noun", "爸爸在家。", "Bàba zài jiā.", "Dad is at home."],
  "妈妈": ["māma", "mother; mom", "noun", "妈妈喜欢茶。", "Māma xǐhuan chá.", "Mom likes tea."],
  "哥哥": ["gēge", "older brother", "noun", "哥哥是学生。", "Gēge shì xuésheng.", "My older brother is a student."],
  "姐姐": ["jiějie", "older sister", "noun", "姐姐学习汉语。", "Jiějie xuéxí Hànyǔ.", "My older sister studies Mandarin."],
  "弟弟": ["dìdi", "younger brother", "noun", "弟弟喜欢苹果。", "Dìdi xǐhuan píngguǒ.", "My younger brother likes apples."],
  "妹妹": ["mèimei", "younger sister", "noun", "妹妹在学校。", "Mèimei zài xuéxiào.", "My younger sister is at school."],
  "吃": ["chī", "to eat", "verb", "我吃米饭。", "Wǒ chī mǐfàn.", "I eat rice."],
  "喝": ["hē", "to drink", "verb", "爸爸喝茶。", "Bàba hē chá.", "Dad drinks tea."],
  "看": ["kàn", "to look; to watch; to read", "verb", "我看书。", "Wǒ kàn shū.", "I read a book."],
  "听": ["tīng", "to listen", "verb", "我听汉语。", "Wǒ tīng Hànyǔ.", "I listen to Mandarin."],
  "做": ["zuò", "to do; to make", "verb", "妈妈做饭。", "Māma zuò fàn.", "Mom cooks."],
  "工作": ["gōngzuò", "to work; work", "verb; noun", "爸爸在工作。", "Bàba zài gōngzuò.", "Dad is working."],
  "水": ["shuǐ", "water", "noun", "我要一杯水。", "Wǒ yào yì bēi shuǐ.", "I want a cup of water."],
  "茶": ["chá", "tea", "noun", "妈妈喝茶。", "Māma hē chá.", "Mom drinks tea."],
  "米饭": ["mǐfàn", "cooked rice", "noun", "我们吃米饭。", "Wǒmen chī mǐfàn.", "We eat rice."],
  "苹果": ["píngguǒ", "apple", "noun", "我喜欢苹果。", "Wǒ xǐhuan píngguǒ.", "I like apples."],
  "水果": ["shuǐguǒ", "fruit", "noun", "苹果是水果。", "Píngguǒ shì shuǐguǒ.", "An apple is fruit."],
  "想": ["xiǎng", "to want; would like", "verb", "我想喝水。", "Wǒ xiǎng hē shuǐ.", "I would like to drink water."],
  "要": ["yào", "to want; to need", "verb", "我要一杯茶。", "Wǒ yào yì bēi chá.", "I want a cup of tea."],
  "喜欢": ["xǐhuan", "to like", "verb", "我喜欢汉语。", "Wǒ xǐhuan Hànyǔ.", "I like Mandarin."],
  "不": ["bù", "not", "adverb", "我不喝咖啡。", "Wǒ bù hē kāfēi.", "I do not drink coffee."],
  "买": ["mǎi", "to buy", "verb", "我买一个苹果。", "Wǒ mǎi yí ge píngguǒ.", "I am buying an apple."],
  "钱": ["qián", "money", "noun", "我有十块钱。", "Wǒ yǒu shí kuài qián.", "I have ten yuan."],
  "块": ["kuài", "yuan; piece", "measure word", "这个苹果五块钱。", "Zhège píngguǒ wǔ kuài qián.", "This apple is five yuan."],
  "多": ["duō", "many; much", "adjective", "你多大？", "Nǐ duō dà?", "How old are you?"],
  "少": ["shǎo", "few; little", "adjective", "今天人很少。", "Jīntiān rén hěn shǎo.", "There are few people today."],
  "书": ["shū", "book", "noun", "这是我的书。", "Zhè shì wǒ de shū.", "This is my book."],
  "学校": ["xuéxiào", "school", "noun", "我去学校。", "Wǒ qù xuéxiào.", "I go to school."],
  "商店": ["shāngdiàn", "shop; store", "noun", "商店在这里。", "Shāngdiàn zài zhèlǐ.", "The shop is here."],
  "医院": ["yīyuàn", "hospital", "noun", "医院在那儿。", "Yīyuàn zài nàr.", "The hospital is over there."],
  "去": ["qù", "to go", "verb", "我去中国。", "Wǒ qù Zhōngguó.", "I am going to China."],
  "来": ["lái", "to come", "verb", "你明天来吗？", "Nǐ míngtiān lái ma?", "Are you coming tomorrow?"],
  "在": ["zài", "to be at; in", "verb; preposition", "我在学校。", "Wǒ zài xuéxiào.", "I am at school."],
  "有": ["yǒu", "to have; there is", "verb", "我有一个朋友。", "Wǒ yǒu yí ge péngyou.", "I have a friend."],
  "听": ["tīng", "to listen", "verb", "我们听汉语。", "Wǒmen tīng Hànyǔ.", "We listen to Mandarin."],
  "上午": ["shàngwǔ", "morning; before noon", "time word", "我上午学习。", "Wǒ shàngwǔ xuéxí.", "I study in the morning."],
  "下午": ["xiàwǔ", "afternoon", "time word", "我下午回家。", "Wǒ xiàwǔ huí jiā.", "I go home in the afternoon."],
};

const extras = [
  ["今年", "jīnnián", "this year", "time word", "我今年十岁。", "Wǒ jīnnián shí suì.", "I am ten years old this year."],
  ["和", "hé", "and; with", "conjunction", "我和妈妈在家。", "Wǒ hé māma zài jiā.", "My mother and I are at home."],
  ["坐", "zuò", "to sit; to ride", "verb", "我坐公共汽车去学校。", "Wǒ zuò gōnggòng qìchē qù xuéxiào.", "I take the bus to school."],
  ["多少钱", "duōshao qián", "how much money; how much does it cost", "question phrase", "这个苹果多少钱？", "Zhège píngguǒ duōshao qián?", "How much is this apple?"],
  ["喜欢", "xǐhuan", "to like", "verb", "我喜欢茶。", "Wǒ xǐhuan chá.", "I like tea."],
  ["同学", "tóngxué", "classmate", "noun", "我的同学是学生。", "Wǒ de tóngxué shì xuésheng.", "My classmate is a student."],
  ["安娜", "Ānnà", "Anna (a name)", "proper noun", "安娜是学生。", "Ānnà shì xuésheng.", "Anna is a student."],
  ["也", "yě", "also; too", "adverb", "我也学习汉语。", "Wǒ yě xuéxí Hànyǔ.", "I also study Mandarin."],
  ["写", "xiě", "to write", "verb", "我写汉字。", "Wǒ xiě Hànzì.", "I write Chinese characters."],
  ["读", "dú", "to read", "verb", "我读中文。", "Wǒ dú Zhōngwén.", "I read Chinese."],
  ["会", "huì", "can; know how to", "modal verb", "我会说汉语。", "Wǒ huì shuō Hànyǔ.", "I can speak Mandarin."],
  ["谁", "shéi", "who", "question word", "谁是老师？", "Shéi shì lǎoshī?", "Who is the teacher?"],
  ["哪里", "nǎlǐ", "where", "question word", "你家在哪里？", "Nǐ jiā zài nǎlǐ?", "Where is your home?"],
  ["吃饭", "chī fàn", "to eat a meal", "verb phrase", "我们晚上吃饭。", "Wǒmen wǎnshang chī fàn.", "We eat in the evening."],
  ["这个", "zhège", "this; this one", "demonstrative", "这个苹果很好。", "Zhège píngguǒ hěn hǎo.", "This apple is very good."],
  ["五个", "wǔ ge", "five (items)", "number phrase", "我有五个苹果。", "Wǒ yǒu wǔ ge píngguǒ.", "I have five apples."],
  ["五元", "wǔ yuán", "five yuan", "number phrase", "这个苹果五元。", "Zhège píngguǒ wǔ yuán.", "This apple is five yuan."],
  ["两杯", "liǎng bēi", "two cups", "measure phrase", "我要两杯茶。", "Wǒ yào liǎng bēi chá.", "I want two cups of tea."],
  ["上午", "shàngwǔ", "morning; before noon", "time word", "上午我学习。", "Shàngwǔ wǒ xuéxí.", "I study in the morning."],
  ["下午", "xiàwǔ", "afternoon", "time word", "下午我回家。", "Xiàwǔ wǒ huí jiā.", "I go home in the afternoon."],
  ["那里", "nàlǐ", "there", "place word", "老师在那里。", "Lǎoshī zài nàlǐ.", "The teacher is there."],
  ["也", "yě", "also; too", "adverb", "我也喜欢苹果。", "Wǒ yě xǐhuan píngguǒ.", "I also like apples."],
  ["大", "dà", "big; (in age) old", "adjective", "你多大？", "Nǐ duō dà?", "How old are you?"],
  ["星期一", "xīngqī yī", "Monday", "time word", "星期一我去学校。", "Xīngqī yī wǒ qù xuéxiào.", "I go to school on Monday."],
  ["星期二", "xīngqī èr", "Tuesday", "time word", "星期二我们学习汉语。", "Xīngqī èr wǒmen xuéxí Hànyǔ.", "We study Mandarin on Tuesday."],
  ["星期三", "xīngqī sān", "Wednesday", "time word", "星期三妈妈在家。", "Xīngqī sān māma zài jiā.", "Mom is at home on Wednesday."],
  ["星期四", "xīngqī sì", "Thursday", "time word", "星期四我喝茶。", "Xīngqī sì wǒ hē chá.", "I drink tea on Thursday."],
  ["星期五", "xīngqī wǔ", "Friday", "time word", "星期五我看书。", "Xīngqī wǔ wǒ kàn shū.", "I read a book on Friday."],
  ["星期六", "xīngqī liù", "Saturday", "time word", "星期六我们回家。", "Xīngqī liù wǒmen huí jiā.", "We go home on Saturday."],
  ["星期日", "xīngqī rì", "Sunday", "time word", "星期日我在家。", "Xīngqī rì wǒ zài jiā.", "I am at home on Sunday."],
  ["日", "rì", "day; date", "time word", "今天是十月一日。", "Jīntiān shì shí yuè yī rì.", "Today is October 1."],
  ["饭", "fàn", "meal; cooked rice", "noun", "我们晚上吃饭。", "Wǒmen wǎnshang chī fàn.", "We eat dinner in the evening."],
  ["面条", "miàntiáo", "noodles", "noun", "我喜欢吃面条。", "Wǒ xǐhuan chī miàntiáo.", "I like eating noodles."],
  ["杯", "bēi", "cup; measure word for cups", "measure word", "我要一杯水。", "Wǒ yào yì bēi shuǐ.", "I want a cup of water."],
  ["卖", "mài", "to sell", "verb", "这家商店卖水果。", "Zhè jiā shāngdiàn mài shuǐguǒ.", "This shop sells fruit."],
  ["元", "yuán", "yuan (currency)", "measure word", "一杯茶五元。", "Yì bēi chá wǔ yuán.", "A cup of tea is five yuan."],
  ["贵", "guì", "expensive", "adjective", "这个苹果很贵。", "Zhège píngguǒ hěn guì.", "This apple is expensive."],
  ["便宜", "piányi", "inexpensive", "adjective", "这杯茶很便宜。", "Zhè bēi chá hěn piányi.", "This cup of tea is inexpensive."],
  ["饭店", "fàndiàn", "restaurant", "noun", "我们去饭店吃饭。", "Wǒmen qù fàndiàn chī fàn.", "We are going to a restaurant to eat."],
  ["里面", "lǐmiàn", "inside", "place word", "学生在学校里面。", "Xuésheng zài xuéxiào lǐmiàn.", "The student is inside the school."],
  ["上", "shàng", "on; above", "place word", "书在桌子上。", "Shū zài zhuōzi shàng.", "The book is on the table."],
  ["下", "xià", "under; below", "place word", "猫在桌子下。", "Māo zài zhuōzi xià.", "The cat is under the table."],
  ["车", "chē", "vehicle; car", "noun", "我坐车去学校。", "Wǒ zuò chē qù xuéxiào.", "I go to school by car."],
  ["出租车", "chūzūchē", "taxi", "noun", "我坐出租车回家。", "Wǒ zuò chūzūchē huí jiā.", "I take a taxi home."],
  ["公共汽车", "gōnggòng qìchē", "bus", "noun", "她坐公共汽车去学校。", "Tā zuò gōnggòng qìchē qù xuéxiào.", "She takes the bus to school."],
  ["火车", "huǒchē", "train", "noun", "我们坐火车去中国。", "Wǒmen zuò huǒchē qù Zhōngguó.", "We take a train to China."],
  ["天气", "tiānqì", "weather", "noun", "今天天气很好。", "Jīntiān tiānqì hěn hǎo.", "The weather is nice today."],
  ["热", "rè", "hot", "adjective", "今天很热。", "Jīntiān hěn rè.", "It is hot today."],
  ["冷", "lěng", "cold", "adjective", "今天不冷。", "Jīntiān bù lěng.", "It is not cold today."],
  ["下雨", "xiàyǔ", "to rain", "verb", "今天下雨。", "Jīntiān xiàyǔ.", "It is raining today."],
  ["看书", "kàn shū", "to read a book", "verb phrase", "我晚上看书。", "Wǒ wǎnshang kàn shū.", "I read a book in the evening."],
  ["音乐", "yīnyuè", "music", "noun", "我喜欢听音乐。", "Wǒ xǐhuan tīng yīnyuè.", "I like listening to music."],
  ["听音乐", "tīng yīnyuè", "to listen to music", "verb phrase", "她喜欢听音乐。", "Tā xǐhuan tīng yīnyuè.", "She likes listening to music."],
  ["电影", "diànyǐng", "movie", "noun", "我们晚上看电影。", "Wǒmen wǎnshang kàn diànyǐng.", "We watch a movie in the evening."],
  ["看电影", "kàn diànyǐng", "to watch a movie", "verb phrase", "我和朋友看电影。", "Wǒ hé péngyou kàn diànyǐng.", "My friend and I watch a movie."],
  ["运动", "yùndòng", "exercise; sport", "verb; noun", "我喜欢运动。", "Wǒ xǐhuan yùndòng.", "I like exercising."],
  ["起床", "qǐchuáng", "to get up", "verb", "我早上七点起床。", "Wǒ zǎoshang qī diǎn qǐchuáng.", "I get up at seven in the morning."],
  ["睡觉", "shuìjiào", "to sleep; to go to bed", "verb", "我晚上十点睡觉。", "Wǒ wǎnshang shí diǎn shuìjiào.", "I go to bed at ten in the evening."],
  ["早上", "zǎoshang", "morning", "time word", "我早上喝水。", "Wǒ zǎoshang hē shuǐ.", "I drink water in the morning."],
  ["晚上", "wǎnshang", "evening", "time word", "晚上我们回家。", "Wǎnshang wǒmen huí jiā.", "We go home in the evening."],
  ["几点", "jǐ diǎn", "what time; how many o'clock", "question phrase", "现在几点？", "Xiànzài jǐ diǎn?", "What time is it now?"],
  ["能", "néng", "can; to be able to", "modal verb", "我能说汉语。", "Wǒ néng shuō Hànyǔ.", "I can speak Mandarin."],
  ["可以", "kěyǐ", "may; can", "modal verb", "我可以喝水吗？", "Wǒ kěyǐ hē shuǐ ma?", "May I drink some water?"],
  ["怎么", "zěnme", "how", "question word", "你怎么去学校？", "Nǐ zěnme qù xuéxiào?", "How do you go to school?"],
  ["了", "le", "completed-action particle", "particle", "我吃饭了。", "Wǒ chī fàn le.", "I have eaten."],
];

let extraIndex = 0;
for (const [hanzi, pinyin, meaning, partOfSpeech, example, examplePinyin, exampleMeaning] of extras) {
  bank.set(hanzi, {
    id: `hsk1-extra-${String(++extraIndex).padStart(3, "0")}`,
    hanzi, pinyin, meaning, partOfSpeech, example, examplePinyin, exampleMeaning, level: "HSK1",
  });
}

for (const [hanzi, values] of Object.entries(examples)) {
  const word = bank.get(hanzi);
  if (word) bank.set(hanzi, { ...word, pinyin: values[0], meaning: values[1], partOfSpeech: values[2], example: values[3], examplePinyin: values[4], exampleMeaning: values[5] });
}

const day = (title, unitTitle, words, objective, reading, pinyin, translation, qa, order = null) => ({
  title, unitTitle, words, objective, reading, pinyin, translation, qa, order,
});

const plans = [
  day("Hello and goodbye", "Greetings and introductions", ["你好", "再见", "谢谢", "不客气", "我", "你", "叫", "好"], "Greet someone and respond politely.", "你好！我叫安娜。谢谢你，再见！", "Nǐ hǎo! Wǒ jiào Ānnà. Xièxie nǐ, zàijiàn!", "Hello! My name is Anna. Thank you; goodbye!", [["What is the speaker's name?", ["Anna", "Ming", "Li"], "Anna"], ["What does the speaker say before leaving?", ["Goodbye", "Good morning", "Thank you"], "Goodbye"]], ["我", "叫", "安娜"]),
  day("Introducing yourself", "Greetings and introductions", ["我", "你", "叫", "名字", "什么", "是", "吗"], "Say your name and ask another person's name.", "我叫安娜。我是学生。你叫什么名字？", "Wǒ jiào Ānnà. Wǒ shì xuésheng. Nǐ jiào shénme míngzi?", "My name is Anna. I am a student. What is your name?", [["Who is a student?", ["Anna", "The teacher", "The friend"], "Anna"], ["What does Anna ask?", ["The other person's name", "The time", "The price"], "The other person's name"]], ["你", "叫", "什么", "名字"]),
  day("Numbers from zero to ten", "Numbers and dates", ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"], "Recognize and say the numbers from zero through ten.", "我有三个苹果。你有几个？我有五个。", "Wǒ yǒu sān ge píngguǒ. Nǐ yǒu jǐ ge? Wǒ yǒu wǔ ge.", "I have three apples. How many do you have? I have five.", [["How many apples does the speaker have first?", ["Three", "Five", "Ten"], "Three"], ["How many apples does the other person have?", ["Five", "Three", "One"], "Five"]], ["我", "有", "五个", "苹果"]),
  day("Asking someone's age", "Numbers and dates", ["几", "岁", "多", "大", "今年", "十"], "Ask and answer a simple age question.", "你几岁？我今年十岁。你多大？我也十岁。", "Nǐ jǐ suì? Wǒ jīnnián shí suì. Nǐ duō dà? Wǒ yě shí suì.", "How old are you? I am ten this year. How old are you? I am ten too.", [["How old is the speaker?", ["Ten", "Seven", "Five"], "Ten"], ["Which phrase asks someone's age?", ["你多大？", "你在哪儿？", "你好吗？"], "你多大？"]], ["我", "今年", "十", "岁"]),
  day("Family members", "Family and people", ["爸爸", "妈妈", "哥哥", "姐姐", "弟弟", "妹妹", "和"], "Name close family members.", "我家有六个人。爸爸和妈妈在家。哥哥、姐姐、弟弟和妹妹也在家。", "Wǒ jiā yǒu liù ge rén. Bàba hé māma zài jiā. Gēge, jiějie, dìdi hé mèimei yě zài jiā.", "There are six people in my family. Dad and Mom are at home. My older brother, older sister, younger brother, and younger sister are home too.", [["Who is at home with Dad?", ["Mom", "The teacher", "Anna"], "Mom"], ["How many family members are mentioned?", ["Six", "Four", "Three"], "Six"]], ["爸爸", "妈妈", "在", "家"]),
  day("People and pronouns", "Family and people", ["我", "你", "他", "她", "我们", "他们"], "Tell people apart with basic Mandarin pronouns.", "我是学生。他是老师。她也是老师。我们在学校，他们在家。", "Wǒ shì xuésheng. Tā shì lǎoshī. Tā yě shì lǎoshī. Wǒmen zài xuéxiào, tāmen zài jiā.", "I am a student. He is a teacher. She is a teacher too. We are at school; they are at home.", [["Who is a student?", ["The speaker", "The woman", "The man"], "The speaker"], ["Where are they?", ["At home", "At school", "At the restaurant"], "At home"]], ["我们", "在", "学校"]),
  day("Countries and people", "Family and people", ["中国", "美国", "英国", "人", "学生", "老师"], "Name three countries and say where someone is from.", "安娜是美国人。李老师是中国人。我们在学校认识一个英国学生。", "Ānnà shì Měiguó rén. Lǐ lǎoshī shì Zhōngguó rén. Wǒmen zài xuéxiào rènshi yí ge Yīngguó xuésheng.", "Anna is American. Teacher Li is Chinese. We meet a British student at school.", [["Where is Anna from?", ["The United States", "China", "The United Kingdom"], "The United States"], ["Where do they meet the student?", ["At school", "At home", "At a shop"], "At school"]]),
  day("At school", "Study and daily life", ["学校", "学生", "老师", "学习", "汉语", "中文", "同学"], "Talk about a class and what you study.", "我是学生。我在学校学习汉语。老师说中文，我和同学听。", "Wǒ shì xuésheng. Wǒ zài xuéxiào xuéxí Hànyǔ. Lǎoshī shuō Zhōngwén, wǒ hé tóngxué tīng.", "I am a student. I study Mandarin at school. The teacher speaks Chinese, and my classmates and I listen.", [["What does the student study?", ["Mandarin", "English", "Math"], "Mandarin"], ["Who speaks Chinese?", ["The teacher", "The student", "The mother"], "The teacher"]], ["老师", "说", "中文"]),
  day("Daily activities", "Study and daily life", ["吃", "喝", "看", "听", "学习", "工作", "做"], "Use common verbs to describe a day.", "早上我喝水。中午我吃饭。下午我工作，晚上我看书、听汉语。", "Zǎoshang wǒ hē shuǐ. Zhōngwǔ wǒ chī fàn. Xiàwǔ wǒ gōngzuò, wǎnshang wǒ kàn shū, tīng Hànyǔ.", "In the morning I drink water. At noon I eat. In the afternoon I work; in the evening I read and listen to Mandarin.", [["What does the speaker drink in the morning?", ["Water", "Tea", "Coffee"], "Water"], ["What does the speaker do in the evening?", ["Read and listen", "Go to school", "Sleep"], "Read and listen"]]),
  day("Today, tomorrow, and yesterday", "Numbers and dates", ["今天", "明天", "昨天", "现在", "点", "分钟"], "Place simple time words in a sentence.", "昨天我在家。今天我在学校。现在三点，我学习十分钟。明天我回家。", "Zuótiān wǒ zài jiā. Jīntiān wǒ zài xuéxiào. Xiànzài sān diǎn, wǒ xuéxí shí fēnzhōng. Míngtiān wǒ huí jiā.", "Yesterday I was at home. Today I am at school. It is three o'clock; I study for ten minutes. Tomorrow I go home.", [["Where was the speaker yesterday?", ["At home", "At school", "At a shop"], "At home"], ["What time is it in the passage?", ["Three o'clock", "Ten o'clock", "Six o'clock"], "Three o'clock"]]),
  day("Weekdays and dates", "Numbers and dates", ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日", "月", "日", "年"], "Say the days of the week and read a simple date.", "星期一我学习。星期三我看书。星期日我在家。今天是十月一日。", "Xīngqī yī wǒ xuéxí. Xīngqī sān wǒ kàn shū. Xīngqī rì wǒ zài jiā. Jīntiān shì shí yuè yī rì.", "I study on Monday. I read on Wednesday. I am at home on Sunday. Today is October 1.", [["On which day is the speaker at home?", ["Sunday", "Monday", "Wednesday"], "Sunday"], ["What date is it?", ["October 1", "October 10", "January 1"], "October 1"]]),
  day("Food and drink", "Food and shopping", ["饭", "水", "茶", "米饭", "面条", "苹果", "水果"], "Name familiar foods and drinks.", "我早上喝水。中午我吃米饭和苹果。晚上我喜欢吃面条，也喝茶。", "Wǒ zǎoshang hē shuǐ. Zhōngwǔ wǒ chī mǐfàn hé píngguǒ. Wǎnshang wǒ xǐhuan chī miàntiáo, yě hē chá.", "I drink water in the morning. At noon I eat rice and an apple. In the evening I like noodles and tea.", [["What does the speaker eat at noon?", ["Rice and an apple", "Noodles and tea", "Bread and milk"], "Rice and an apple"], ["What does the speaker drink in the evening?", ["Tea", "Water", "Coffee"], "Tea"]]),
  day("Ordering food politely", "Food and shopping", ["想", "要", "喜欢", "不", "杯", "咖啡"], "Say what you want and what you like or do not like.", "我想喝茶。我要一杯水。朋友喜欢咖啡，我不喜欢咖啡。", "Wǒ xiǎng hē chá. Wǒ yào yì bēi shuǐ. Péngyou xǐhuan kāfēi, wǒ bù xǐhuan kāfēi.", "I would like tea. I want a cup of water. My friend likes coffee; I do not like coffee.", [["What does the speaker want?", ["A cup of water", "Coffee", "An apple"], "A cup of water"], ["Who likes coffee?", ["The friend", "The speaker", "The teacher"], "The friend"]]),
  day("Shopping and money", "Food and shopping", ["买", "卖", "钱", "多少", "元", "块", "贵", "便宜"], "Ask a price and compare expensive and inexpensive items.", "我去商店买苹果。苹果五元，茶三元。这个苹果不贵，茶很便宜。", "Wǒ qù shāngdiàn mǎi píngguǒ. Píngguǒ wǔ yuán, chá sān yuán. Zhège píngguǒ bú guì, chá hěn piányi.", "I go to the shop to buy apples. Apples are five yuan and tea is three yuan. The apple is not expensive; the tea is inexpensive.", [["How much is the tea?", ["Three yuan", "Five yuan", "Ten yuan"], "Three yuan"], ["Which item is inexpensive?", ["Tea", "The apple", "Both"], "Tea"]], ["这个", "苹果", "五元"]),
  day("Numbers and prices", "Food and shopping", ["一", "五", "十", "元", "块", "多少钱", "个"], "Read and ask about simple prices.", "一个苹果五元。两杯茶十元。你有十块钱吗？", "Yí ge píngguǒ wǔ yuán. Liǎng bēi chá shí yuán. Nǐ yǒu shí kuài qián ma?", "One apple is five yuan. Two cups of tea are ten yuan. Do you have ten yuan?", [["How much are two cups of tea?", ["Ten yuan", "Five yuan", "One yuan"], "Ten yuan"], ["How much is one apple?", ["Five yuan", "Ten yuan", "Two yuan"], "Five yuan"]], ["两杯", "茶", "十元"]),
  day("Places around town", "Places and directions", ["家", "学校", "商店", "医院", "饭店"], "Name familiar places and say where you are going.", "我从家去学校。学校旁边有商店。妈妈去饭店，爸爸去医院。", "Wǒ cóng jiā qù xuéxiào. Xuéxiào pángbiān yǒu shāngdiàn. Māma qù fàndiàn, bàba qù yīyuàn.", "I go from home to school. There is a shop beside the school. Mom goes to the restaurant; Dad goes to the hospital.", [["Where does Mom go?", ["The restaurant", "The school", "The hospital"], "The restaurant"], ["What is beside the school?", ["A shop", "A home", "A bus stop"], "A shop"]]),
  day("Finding things: in, on, and under", "Places and directions", ["在", "里面", "这里", "那里", "上", "下"], "Say where a person or object is.", "书在桌子上，猫在桌子下。学生在教室里面。老师在这里，不在那里。", "Shū zài zhuōzi shàng, māo zài zhuōzi xià. Xuésheng zài jiàoshì lǐmiàn. Lǎoshī zài zhèlǐ, bú zài nàlǐ.", "The book is on the table, and the cat is under it. The student is inside the classroom. The teacher is here, not there.", [["Where is the book?", ["On the table", "Under the table", "Inside the school"], "On the table"], ["Where is the teacher?", ["Here", "There", "At home"], "Here"]]),
  day("Getting around by bus, taxi, and train", "Places and directions", ["车", "出租车", "公共汽车", "火车", "去", "来"], "Name common ways to travel.", "我坐公共汽车去学校。爸爸坐出租车回家。明天我们坐火车来。", "Wǒ zuò gōnggòng qìchē qù xuéxiào. Bàba zuò chūzūchē huí jiā. Míngtiān wǒmen zuò huǒchē lái.", "I take the bus to school. Dad takes a taxi home. Tomorrow we will come by train.", [["How does the speaker go to school?", ["By bus", "By taxi", "By train"], "By bus"], ["How does Dad get home?", ["By taxi", "By bus", "By train"], "By taxi"]]),
  day("Asking where things are", "Places and directions", ["这", "那", "哪", "哪儿", "哪里", "这里"], "Ask where a person or place is.", "这是学校，那是商店。你去哪儿？医院在哪里？老师在这里。", "Zhè shì xuéxiào, nà shì shāngdiàn. Nǐ qù nǎr? Yīyuàn zài nǎlǐ? Lǎoshī zài zhèlǐ.", "This is a school; that is a shop. Where are you going? Where is the hospital? The teacher is here.", [["Where is the teacher?", ["Here", "At the shop", "At the hospital"], "Here"], ["What does the speaker ask about the hospital?", ["Where it is", "How much it costs", "What it is called"], "Where it is"]]),
  day("Weather and simple descriptions", "Daily life and hobbies", ["天气", "热", "冷", "下雨", "好", "很"], "Describe the weather with a few basic words.", "今天天气很好，不冷。下午很热。昨天在下雨，今天没有雨。", "Jīntiān tiānqì hěn hǎo, bù lěng. Xiàwǔ hěn rè. Zuótiān zài xiàyǔ, jīntiān méiyǒu yǔ.", "The weather is nice today and not cold. It is hot in the afternoon. It rained yesterday; it is not raining today.", [["How is the weather today?", ["Nice and not cold", "Very cold", "Raining"], "Nice and not cold"], ["When is it hot?", ["In the afternoon", "Yesterday", "In the morning"], "In the afternoon"]]),
  day("Hobbies and free time", "Daily life and hobbies", ["喜欢", "看书", "听音乐", "音乐", "看电影", "电影", "运动", "书"], "Talk about a few things you enjoy doing.", "我喜欢看书，也喜欢听音乐。星期六我和朋友看电影。我们也喜欢运动。", "Wǒ xǐhuan kàn shū, yě xǐhuan tīng yīnyuè. Xīngqī liù wǒ hé péngyou kàn diànyǐng. Wǒmen yě xǐhuan yùndòng.", "I like reading and listening to music. On Saturday my friend and I watch a movie. We also like sports.", [["What does the speaker like listening to?", ["Music", "A book", "The radio"], "Music"], ["What do the friends do on Saturday?", ["Watch a movie", "Go to school", "Buy tea"], "Watch a movie"]]),
  day("A simple daily routine", "Daily life and hobbies", ["起床", "吃饭", "学习", "睡觉", "早上", "晚上"], "Describe a simple morning and evening routine.", "我早上七点起床，喝水，吃饭。白天我学习。晚上十点我睡觉。", "Wǒ zǎoshang qī diǎn qǐchuáng, hē shuǐ, chī fàn. Báitiān wǒ xuéxí. Wǎnshang shí diǎn wǒ shuìjiào.", "I get up at seven, drink water, and eat. I study during the day. I go to bed at ten in the evening.", [["When does the speaker get up?", ["At seven in the morning", "At ten in the evening", "At noon"], "At seven in the morning"], ["What happens at ten?", ["The speaker goes to bed", "The speaker eats", "The speaker goes to school"], "The speaker goes to bed"]]),
  day("Asking and telling the time", "Daily life and hobbies", ["几点", "现在", "上午", "下午", "晚上", "分钟"], "Ask the time and understand parts of the day.", "上午八点我去学校。现在几点？现在下午三点。我们学习十分钟，晚上回家。", "Shàngwǔ bā diǎn wǒ qù xuéxiào. Xiànzài jǐ diǎn? Xiànzài xiàwǔ sān diǎn. Wǒmen xuéxí shí fēnzhōng, wǎnshang huí jiā.", "I go to school at eight in the morning. What time is it now? It is three in the afternoon. We study for ten minutes and go home in the evening.", [["What time is it now in the passage?", ["Three in the afternoon", "Eight in the morning", "Ten at night"], "Three in the afternoon"], ["How long do they study?", ["Ten minutes", "Eight minutes", "One hour"], "Ten minutes"]]),
  day("Talking about what you can do", "Questions and sentence building", ["会", "能", "可以", "说", "写", "读"], "Use simple words for ability and permission.", "我会说汉语，也会读中文。我能写几个字。这里可以听音乐吗？", "Wǒ huì shuō Hànyǔ, yě huì dú Zhōngwén. Wǒ néng xiě jǐ ge zì. Zhèlǐ kěyǐ tīng yīnyuè ma?", "I can speak Mandarin and read Chinese. I can write a few characters. May I listen to music here?", [["What can the speaker read?", ["Chinese", "English", "A menu"], "Chinese"], ["What does the speaker ask permission to do?", ["Listen to music", "Go home", "Buy a book"], "Listen to music"]]),
  day("Everyday question words", "Questions and sentence building", ["什么", "谁", "哪", "哪里", "几", "多少", "怎么"], "Choose the right question word for a simple question.", "你叫什么名字？谁是你的老师？你怎么去学校？你家在哪里？", "Nǐ jiào shénme míngzi? Shéi shì nǐ de lǎoshī? Nǐ zěnme qù xuéxiào? Nǐ jiā zài nǎlǐ?", "What is your name? Who is your teacher? How do you go to school? Where is your home?", [["Which question asks who the teacher is?", ["谁是你的老师？", "你家在哪里？", "你叫什么名字？"], "谁是你的老师？"], ["Which question asks how someone travels?", ["你怎么去学校？", "你几岁？", "这是什么？"], "你怎么去学校？"]]),
  day("Basic grammar: is, have, at, and 的", "Questions and sentence building", ["是", "有", "在", "的", "了", "不"], "Notice simple sentence patterns and the completed-action particle 了.", "我是学生，我有一本书。书在桌子上，这是我的书。今天我买了一个苹果。", "Wǒ shì xuésheng, wǒ yǒu yì běn shū. Shū zài zhuōzi shàng, zhè shì wǒ de shū. Jīntiān wǒ mǎi le yí ge píngguǒ.", "I am a student and I have a book. The book is on the table; it is my book. Today I bought an apple.", [["What does the speaker have?", ["A book", "A cat", "A cup of tea"], "A book"], ["What did the speaker buy?", ["An apple", "A book", "A cup"], "An apple"]]),
  day("Build simple sentences", "Questions and sentence building", ["喜欢", "不", "想", "要", "也", "会"], "Make useful sentences with like, not, want, and can.", "我喜欢汉语，也喜欢看书。我不喜欢咖啡。我想喝茶，我要一杯水。我会说一点中文。", "Wǒ xǐhuan Hànyǔ, yě xǐhuan kàn shū. Wǒ bù xǐhuan kāfēi. Wǒ xiǎng hē chá, wǒ yào yì bēi shuǐ. Wǒ huì shuō yìdiǎn Zhōngwén.", "I like Mandarin and reading. I do not like coffee. I would like tea and a cup of water. I can speak a little Chinese.", [["What does the speaker not like?", ["Coffee", "Tea", "Water"], "Coffee"], ["What can the speaker do?", ["Speak a little Chinese", "Drive a car", "Read English"], "Speak a little Chinese"]], ["我", "想", "喝", "茶"]),
  day("Review: greetings, people, and numbers", "Review and HSK 1 practice", ["你好", "谢谢", "我", "你", "三", "五", "爸爸", "妈妈"], "Review greetings, pronouns, numbers, and family words.", "你好！我是学生，叫安娜。爸爸有三个苹果，妈妈有五个。谢谢你！", "Nǐ hǎo! Wǒ shì xuésheng, jiào Ānnà. Bàba yǒu sān ge píngguǒ, māma yǒu wǔ ge. Xièxie nǐ!", "Hello! I am a student named Anna. Dad has three apples, and Mom has five. Thank you!", [["How many apples does Dad have?", ["Three", "Five", "One"], "Three"], ["Who has five apples?", ["Mom", "Dad", "Anna"], "Mom"]]),
  day("Mixed review: school, time, and food", "Review and HSK 1 practice", ["学校", "学习", "今天", "几点", "水", "茶", "饭", "书"], "Connect familiar words in short everyday situations.", "今天上午八点我去学校学习。中午我吃饭、喝水。下午三点我看书，晚上喝茶。", "Jīntiān shàngwǔ bā diǎn wǒ qù xuéxiào xuéxí. Zhōngwǔ wǒ chī fàn, hē shuǐ. Xiàwǔ sān diǎn wǒ kàn shū, wǎnshang hē chá.", "Today I go to school at eight in the morning to study. At noon I eat and drink water. At three I read; in the evening I drink tea.", [["When does the speaker read?", ["At three in the afternoon", "At eight in the morning", "At noon"], "At three in the afternoon"], ["What does the speaker drink at noon?", ["Water", "Tea", "Coffee"], "Water"]]),
  day("Final review: an HSK 1 day", "Review and HSK 1 practice", ["你好", "什么", "星期日", "火车", "喜欢", "汉语", "家", "苹果"], "Bring together the course's greetings, questions, time, places, and preferences.", "你好！我叫安娜，是学生。我喜欢汉语，也喜欢苹果。星期日我和妈妈坐火车回家。你叫什么名字？", "Nǐ hǎo! Wǒ jiào Ānnà, shì xuésheng. Wǒ xǐhuan Hànyǔ, yě xǐhuan píngguǒ. Xīngqī rì wǒ hé māma zuò huǒchē huí jiā. Nǐ jiào shénme míngzi?", "Hello! My name is Anna, and I am a student. I like Mandarin and apples. On Sunday Mom and I take the train home. What is your name?", [["Who travels home with Anna?", ["Her mother", "Her teacher", "Her friend"], "Her mother"], ["What does Anna like?", ["Mandarin and apples", "Coffee and tea", "Books and movies"], "Mandarin and apples"]], ["星期日", "我", "和", "妈妈", "坐", "火车", "回", "家"]),
];

const readingCount = (text) => text.split(/[。！？]/u).filter((part) => part.trim()).length;

const exerciseTypes = ["CHARACTER_TO_ENGLISH", "ENGLISH_TO_CHARACTER", "CHARACTER_TO_PINYIN", "PINYIN_TO_CHARACTER", "SENTENCE_TRANSLATION", "FILL_IN_THE_BLANK", "MATCH_CHINESE_TO_ENGLISH", "MATCH_ENGLISH_TO_CHINESE", "WORD_ORDER"];
const allKnown = [];

function makeChoices(answer, candidates) {
  const unique = [answer, ...candidates.filter((value) => value && value !== answer)];
  return [...new Set(unique)].slice(0, 4);
}

function exercise(id, type, question, prompt, options, correctAnswer, explanation, vocabularyId, listenText) {
  return { id, type, question, prompt, options, correctAnswer, explanation, vocabularyId, ...(listenText ? { listenText } : {}) };
}

const result = [];
for (let index = 0; index < plans.length; index += 1) {
  const plan = plans[index];
  const dayNumber = index + 1;
  if (plan.words.length < 8) {
    const previouslyLearned = plans.slice(0, index).flatMap((earlier) => earlier.words).reverse();
    for (const word of previouslyLearned) {
      if (plan.words.length >= 8) break;
      if (!plan.words.includes(word)) plan.words.push(word);
    }
  }
  const targetReadings = dayNumber <= 7 ? 2 : dayNumber <= 15 ? 3 : dayNumber <= 23 ? 4 : 5;
  const fillers = [
    ["我也在家。", "Wǒ yě zài jiā.", "I am at home too."],
    ["我们今天学习汉语。", "Wǒmen jīntiān xuéxí Hànyǔ.", "We study Mandarin today."],
    ["明天我和朋友去学校。", "Míngtiān wǒ hé péngyou qù xuéxiào.", "Tomorrow my friend and I will go to school."],
    ["晚上我们回家。", "Wǎnshang wǒmen huí jiā.", "We go home in the evening."],
    ["我喜欢看书，也喜欢喝茶。", "Wǒ xǐhuan kàn shū, yě xǐhuan hē chá.", "I like reading and drinking tea."],
  ];
  while (readingCount(plan.reading) < targetReadings) {
    const [hanzi, pinyin, translation] = fillers[readingCount(plan.reading) % fillers.length];
    plan.reading += ` ${hanzi}`;
    plan.pinyin += ` ${pinyin}`;
    plan.translation += ` ${translation}`;
  }
  const vocabulary = [...new Set(plan.words)].map((hanzi) => {
    const word = bank.get(hanzi);
    if (!word) throw new Error(`Missing word data: ${hanzi}`);
    return { ...word };
  });
  allKnown.push(...vocabulary);
  const ids = new Set(vocabulary.map((word) => word.id));
  const listenWord = vocabulary[dayNumber % vocabulary.length];
  const listeningChoices = makeChoices(listenWord.meaning, [...vocabulary, ...allKnown].map((word) => word.meaning));
  const listeningExercise = exercise(`hsk1-day-${String(dayNumber).padStart(2, "0")}-listen-01`, "LISTENING_COMPREHENSION", "Listen and choose the meaning.", "Play the audio, then select its meaning.", listeningChoices, listenWord.meaning, `${listenWord.hanzi} (${listenWord.pinyin}) means ${listenWord.meaning}.`, listenWord.id, listenWord.hanzi);

  const readingQuestions = plan.qa.map(([question, options, answer], questionIndex) => {
    const related = vocabulary[(questionIndex + 1) % vocabulary.length];
    return exercise(`hsk1-day-${String(dayNumber).padStart(2, "0")}-read-${String(questionIndex + 1).padStart(2, "0")}`, "MULTIPLE_CHOICE", question, plan.reading, options, answer, `Read the passage again: ${plan.translation}`, related.id);
  });

  const types = [exerciseTypes[(dayNumber - 1) % exerciseTypes.length], exerciseTypes[dayNumber % exerciseTypes.length], exerciseTypes[(dayNumber + 1) % exerciseTypes.length], exerciseTypes[(dayNumber + 2) % exerciseTypes.length]];
  const practiceExercises = types.map((type, exerciseIndex) => {
    const word = vocabulary[exerciseIndex % vocabulary.length];
    const otherWords = [...vocabulary.filter((item) => item.id !== word.id), ...allKnown.filter((item) => item.id !== word.id)];
    const meanings = otherWords.map((item) => item.meaning);
    const hanzi = otherWords.map((item) => item.hanzi);
    const pinyin = otherWords.map((item) => item.pinyin);
    const exampleMeanings = otherWords.map((item) => item.exampleMeaning);
    const key = `hsk1-day-${String(dayNumber).padStart(2, "0")}-practice-${String(exerciseIndex + 1).padStart(2, "0")}`;
    if (type === "CHARACTER_TO_ENGLISH" || type === "MATCH_CHINESE_TO_ENGLISH") {
      return exercise(key, type, type === "MATCH_CHINESE_TO_ENGLISH" ? "Match the Chinese to its meaning." : "What does this mean?", word.hanzi, makeChoices(word.meaning, meanings), word.meaning, `${word.hanzi} (${word.pinyin}) means ${word.meaning}.`, word.id);
    }
    if (type === "ENGLISH_TO_CHARACTER" || type === "MATCH_ENGLISH_TO_CHINESE") {
      return exercise(key, type, type === "MATCH_ENGLISH_TO_CHINESE" ? "Match the English to the Chinese." : "Choose the Chinese characters.", word.meaning, makeChoices(word.hanzi, hanzi), word.hanzi, `${word.meaning} is ${word.hanzi} (${word.pinyin}).`, word.id);
    }
    if (type === "CHARACTER_TO_PINYIN") return exercise(key, type, "Which pinyin matches these characters?", word.hanzi, makeChoices(word.pinyin, pinyin), word.pinyin, `${word.hanzi} is pronounced ${word.pinyin}.`, word.id);
    if (type === "PINYIN_TO_CHARACTER") return exercise(key, type, "Find the matching characters.", word.pinyin, makeChoices(word.hanzi, hanzi), word.hanzi, `${word.pinyin} is written ${word.hanzi}.`, word.id);
    if (type === "SENTENCE_TRANSLATION") return exercise(key, type, "What does this sentence mean?", word.example, makeChoices(word.exampleMeaning, exampleMeanings), word.exampleMeaning, `${word.examplePinyin} — ${word.exampleMeaning}`, word.id);
    if (type === "FILL_IN_THE_BLANK") {
      const blank = word.example.includes(word.hanzi) ? word.example.replace(word.hanzi, "＿＿＿") : `＿＿＿：${word.meaning}`;
      return exercise(key, type, "Fill in the missing characters.", blank, makeChoices(word.hanzi, hanzi), word.hanzi, `${word.example} (${word.examplePinyin})`, word.id);
    }
    if (type === "WORD_ORDER" && plan.order) {
      const ordered = plan.order;
      const scrambled = [...ordered].reverse();
      return exercise(key, type, "Arrange the words to make a sentence.", `Build a sentence: ${ordered.join(" / ")}`, scrambled, ordered.join("|"), `${ordered.join("")}。`, word.id);
    }
    return exercise(key, "CHARACTER_TO_ENGLISH", "What does this mean?", word.hanzi, makeChoices(word.meaning, meanings), word.meaning, `${word.hanzi} (${word.pinyin}) means ${word.meaning}.`, word.id);
  });

  const week = Math.ceil(dayNumber / 6);
  const listeningItems = vocabulary.slice(0, Math.min(3, vocabulary.length)).map(({ hanzi, pinyin, meaning }) => ({ text: hanzi, pinyin, meaning }));
  result.push({
    id: `hsk1-day-${String(dayNumber).padStart(2, "0")}`,
    level: "HSK1",
    unitId: `hsk1-days-${String(week).padStart(2, "0")}`,
    unitNumber: 5 + week,
    unitTitle: `Part ${week}: ${["First conversations", "Daily communication", "Everyday places", "Time and routine", "Build your sentences"][week - 1]}`,
    order: dayNumber,
    dayNumber,
    title: plan.title,
    description: plan.objective,
    objective: plan.objective,
    vocabulary,
    listening: {
      items: listeningItems,
      sentences: [{ text: plan.reading, pinyin: plan.pinyin, meaning: plan.translation }],
      exercises: [listeningExercise],
    },
    reading: {
      text: plan.reading,
      pinyin: plan.pinyin,
      translation: plan.translation,
      questions: readingQuestions,
    },
    practiceExercises,
  });
  if (readingCount(plan.reading) < targetReadings) {
    throw new Error(`Reading is too short for day ${dayNumber}`);
  }
  if (practiceExercises.length !== 4 || readingQuestions.length < 2 || listeningExercise.options.length < 3) {
    throw new Error(`Incomplete daily exercise content on day ${dayNumber}`);
  }
  if (!practiceExercises.every((item) => ids.has(item.vocabularyId))) throw new Error(`Invalid practice word reference on day ${dayNumber}`);
}

const extraWords = extras.map(([hanzi]) => bank.get(hanzi));
const uniqueWords = new Set([...bank.values()].map((word) => word.id));
if (uniqueWords.size !== bank.size || !extraWords.every(Boolean)) throw new Error("Daily vocabulary bank is inconsistent.");
await writeFile(join(root, "content/hsk1/course-30-day.json"), JSON.stringify(result, null, 2) + "\n", "utf8");
console.info(`Generated ${result.length} daily lessons with ${bank.size} dictionary entries.`);

