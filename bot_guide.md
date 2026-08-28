# bot.py (Updated & 100% Automatic)
```python
import asyncio
import logging
from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import Command, CommandObject
from aiohttp import web

# আপনার বটের টোকেন
TOKEN = "8804626300:AAFiVAk5xrGsy9eeKexxkDSdy4QxBqnAG3U"

# আপনার প্রাইভেট চ্যানেলের আইডি
CHANNEL_ID = -1003911010893 

bot = Bot(token=TOKEN)
dp = Dispatcher()

# মুভি পাঠানোর হেল্পার ফাংশন
async def send_movie_to_user(chat_id: int, raw_id_or_text: str):
    raw_data = str(raw_id_or_text).strip()
    if raw_data.isdigit():
        movie_message_id = int(raw_data)
        await bot.copy_message(
            chat_id=chat_id,
            from_chat_id=CHANNEL_ID,
            message_id=movie_message_id
        )
    else:
        await bot.send_message(chat_id=chat_id, text=f"মুভি তথ্য: {raw_data}")

# ১. /start কমান্ড হ্যান্ডলার (ডিপ লিংক ও সাধারণ স্টার্ট)
@dp.message(Command("start"))
async def start_handler(message: types.Message, command: CommandObject):
    user_id = message.from_user.id
    args = command.args

    # যদি মিনি অ্যাপ বা লিংক থেকে মুভি আইডি নিয়ে আসে (/start 2)
    if args and args.strip():
        try:
            await send_movie_to_user(user_id, args.strip())
            return
        except Exception as e:
            logging.error(f"Error sending movie on deep link: {e}")
            await message.answer("দুঃখিত, মুভিটি পাঠাতে সমস্যা হয়েছে। চ্যানেল ও মেসেজ আইডি চেক করুন।")
            return

    await message.answer("হ্যালো! আপনার মিনি অ্যাপ ওপেন করতে মেন্যু বা নিচের বাটনে ক্লিক করুন।")

# ২. মিনি অ্যাপ থেকে পাঠানো ডেটা হ্যান্ডলার
@dp.message(F.web_app_data)
async def handle_web_app_data(message: types.Message):
    user_id = message.from_user.id
    try:
        raw_data = message.web_app_data.data.strip()
        await send_movie_to_user(user_id, raw_data)
    except Exception as e:
        logging.error(f"Error handling web_app_data: {e}")
        await message.answer("দুঃখিত, মুভিটি পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।")

# ৩. ইউজার যদি সরাসরি মেসেজ আইডি টাইপ বা পেস্ট করে পাঠিয়ে দেয়
@dp.message(F.text)
async def handle_text_message(message: types.Message):
    user_id = message.from_user.id
    text = message.text.strip()
    
    # যদি টেক্সটটি শুধুই নাম্বার হয় (যেমন: 2, 45, 102)
    if text.isdigit():
        try:
            await send_movie_to_user(user_id, text)
        except Exception as e:
            logging.error(f"Error sending movie from text id: {e}")
            await message.answer("দুঃখিত, এই আইডির কোনো মুভি পাওয়া যায়নি বা পাঠানো সম্ভব হয়নি।")

# --- Render-এর জন্য ডামি ওয়েব সার্ভার (পোর্ট চালু রাখার জন্য) ---
async def handle(request):
    return web.Response(text="Bot is running!")

async def web_server():
    app = web.Application()
    app.router.add_get("/", handle)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, "0.0.0.0", 10000)
    await site.start()

async def main():
    logging.basicConfig(level=logging.INFO)
    print("Bot and Web Server are running...")
    await asyncio.gather(web_server(), dp.start_polling(bot))

if __name__ == "__main__":
    asyncio.run(main())
```
