import asyncio
import logging
from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import Command
from aiohttp import web  # নতুন যোগ করা হয়েছে

TOKEN = "8804626300:AAFiVAk5xrGsy9eeKexxkDSdy4QxBqnAG3U"
CHANNEL_ID = -1003911010893 

bot = Bot(token=TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def start_handler(message: types.Message):
    await message.answer("হ্যালো! আপনার মিনি অ্যাপ ওপেন করতে নিচের বাটনে ক্লিক করুন।")

@dp.message(F.web_app_data)
async def handle_web_app_data(message: types.Message):
    user_id = message.from_user.id
    try:
        raw_data = message.web_app_data.data.strip()
        
        # যদি অ্যাডমিনের দেওয়া টেক্সটটি একটি Message ID (যেমন: 2, 45, 120) হয়
        if raw_data.isdigit():
            movie_message_id = int(raw_data)
            await bot.copy_message(
                chat_id=user_id,
                from_chat_id=CHANNEL_ID,
                message_id=movie_message_id
            )
        else:
            # অন্য কোনো টেক্সট বা লিংক হলে
            await message.answer(f"মুভি ডেটা: {raw_data}")
    except Exception as e:
        await message.answer("দুঃখিত, মুভিটি পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।")

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
    # একসাথে টেলিগ্রাম বট এবং ওয়েব সার্ভার রান করা
    await asyncio.gather(web_server(), dp.start_polling(bot))

if __name__ == "__main__":
    asyncio.run(main())
