import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";
import isBetween from "dayjs/plugin/isBetween";
import weekday from "dayjs/plugin/weekday";
import "dayjs/locale/zh-cn";

// 注册插件
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(isBetween);
dayjs.extend(weekday);

// 设置中文语言
dayjs.locale("zh-cn");

console.log("========== Day.js 使用案例 ==========\n");

// ==================== 1. 基本用法 ====================
console.log("--- 1. 基本用法 ---");
const now = dayjs();
console.log("当前时间:", now.format()); // 2024-01-01T12:00:00+08:00
console.log("时间戳(秒):", now.unix());
console.log("时间戳(毫秒):", now.valueOf());
console.log("是否有效:", now.isValid());
console.log("");

// ==================== 2. 解析 ====================
console.log("--- 2. 解析各种格式 ---");
const fromString = dayjs("2024-06-15");
const fromTimestamp = dayjs(1718409600000);
const fromDate = dayjs(new Date());
console.log("从字符串解析:", fromString.format("YYYY-MM-DD"));
console.log("从时间戳解析:", fromTimestamp.format("YYYY-MM-DD HH:mm:ss"));
console.log("从Date对象解析:", fromDate.format("YYYY-MM-DD HH:mm:ss"));
console.log("");

// ==================== 3. 格式化 ====================
console.log("--- 3. 格式化输出 ---");
console.log("年-月-日:", now.format("YYYY-MM-DD"));
console.log("时:分:秒:", now.format("HH:mm:ss"));
console.log("完整格式:", now.format("YYYY年MM月DD日 HH:mm:ss"));
console.log("星期:", now.format("dddd")); // 中文星期
console.log("AM/PM:", now.format("YYYY-MM-DD hh:mm A"));
console.log("");

// ==================== 4. 获取/设置 ====================
console.log("--- 4. 获取时间信息 ---");
console.log("年:", now.year());
console.log("月(0-11):", now.month(), "→ 实际月份:", now.month() + 1);
console.log("日:", now.date());
console.log("星期(0-6):", now.day());
console.log("时:", now.hour());
console.log("分:", now.minute());
console.log("秒:", now.second());
console.log("当月天数:", now.daysInMonth());
console.log("");

// ==================== 5. 操作（加减时间） ====================
console.log("--- 5. 时间加减 ---");
console.log("7天后:", now.add(7, "day").format("YYYY-MM-DD"));
console.log("3个月后:", now.add(3, "month").format("YYYY-MM-DD"));
console.log("1年后:", now.add(1, "year").format("YYYY-MM-DD"));
console.log("2小时前:", now.subtract(2, "hour").format("YYYY-MM-DD HH:mm:ss"));
console.log("30分钟前:", now.subtract(30, "minute").format("HH:mm:ss"));
console.log("");

// ==================== 6. 开始/结束 ====================
console.log("--- 6. 获取起止时间 ---");
console.log("今天开始:", now.startOf("day").format("YYYY-MM-DD HH:mm:ss"));
console.log("今天结束:", now.endOf("day").format("YYYY-MM-DD HH:mm:ss"));
console.log("本月开始:", now.startOf("month").format("YYYY-MM-DD"));
console.log("本月结束:", now.endOf("month").format("YYYY-MM-DD"));
console.log("本年开始:", now.startOf("year").format("YYYY-MM-DD"));
console.log("本年结束:", now.endOf("year").format("YYYY-MM-DD"));
console.log("");

// ==================== 7. 比较 ====================
console.log("--- 7. 时间比较 ---");
const date1 = dayjs("2024-01-01");
const date2 = dayjs("2024-12-31");
console.log("date1 在 date2 之前:", date1.isBefore(date2));
console.log("date1 在 date2 之后:", date1.isAfter(date2));
console.log("date1 等于 date2:", date1.isSame(date2));
console.log("按月比较是否相同:", date1.isSame(date2, "month"));
console.log("按年比较是否相同:", date1.isSame(date2, "year"));
console.log("");

// ==================== 8. isBetween 插件 ====================
console.log("--- 8. 判断是否在范围内 ---");
const checkDate = dayjs("2024-06-15");
const start = dayjs("2024-01-01");
const end = dayjs("2024-12-31");
console.log(
  "2024-06-15 在 2024年内:",
  checkDate.isBetween(start, end)
);
console.log(
  "2024-06-15 在 2024-07 ~ 2024-12 内:",
  checkDate.isBetween("2024-07-01", "2024-12-31")
);
console.log("");

// ==================== 9. 相对时间（relativeTime 插件） ====================
console.log("--- 9. 相对时间 ---");
console.log("3小时前:", dayjs().subtract(3, "hour").fromNow());
console.log("2天前:", dayjs().subtract(2, "day").fromNow());
console.log("1个月后:", dayjs().add(1, "month").fromNow());
console.log("到某个日期:", dayjs("2025-01-01").fromNow());
console.log("从现在到某日:", dayjs("2025-01-01").toNow());
console.log("");

// ==================== 10. 时间差（duration 插件） ====================
console.log("--- 10. 计算时间差 ---");
const startDate = dayjs("2024-01-01");
const endDate = dayjs("2024-12-31");
const diff = endDate.diff(startDate);
const diffDays = endDate.diff(startDate, "day");
const diffMonths = endDate.diff(startDate, "month");
console.log("相差毫秒:", diff);
console.log("相差天数:", diffDays);
console.log("相差月数:", diffMonths);

// 使用 duration 格式化时间差
const dur = dayjs.duration(diff);
console.log("duration格式:", dur.months(), "个月", dur.days(), "天");
console.log("");

// ==================== 11. 实用场景 ====================
console.log("--- 11. 实用场景 ---");

// 场景1: 判断是否是今天
const isToday = (date: string) => dayjs(date).isSame(dayjs(), "day");
console.log("2024-01-01 是今天:", isToday("2024-01-01"));
console.log("今天是今天:", isToday(dayjs().format("YYYY-MM-DD")));

// 场景2: 获取本周的起止日期
const weekStart = now.startOf("week");
const weekEnd = now.endOf("week");
console.log("本周起止:", weekStart.format("MM-DD"), "~", weekEnd.format("MM-DD"));

// 场景3: 格式化为接口常用格式
const apiFormat = now.format("YYYY-MM-DDTHH:mm:ssZ");
console.log("API格式:", apiFormat);

// 场景4: 倒计时计算
const targetDate = dayjs("2025-01-01");
const daysLeft = targetDate.diff(dayjs(), "day");
console.log(`距离2025年元旦还有 ${daysLeft} 天`);

console.log("\n========== 案例结束 ==========");