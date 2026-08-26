# bot.py⁠  
import asyncio  
import logging  
from aiogram import Bot, Dispatcher, F, types  
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton  
  
# এখানে আপনার বটের টোকেন বসাবেন  
TOKEN = "8804626300:AAFiVAk5xrGsy9eeKexxkDSdy4QxBqnAG3U"  
  
# আপনার চ্যানেলের আইডি (যেটা আমরা বের করেছিলাম)  
CHANNEL_ID = -1003911010893   
  
bot = Bot(token=TOKEN)  
dp = Dispatcher()  
  
@dp.message(Command("start"))  
async def start_handler(message: types.Message):  
    await message.answer("হ্যালো! আপনার মিনি অ্যাপ ওপেন করতে নিচের বাটনে ক্লিক করুন।")  
  
# ইউজার যখন মিনি অ্যাপ থেকে মুভির মেসেজ আইডি পাঠাবে, তখন এটি কাজ করবে  
@dp.message(F.web_app_data)  
async def handle_web_app_data(message: types.Message):  
    user_id = message.from_user.id  
    try:  
        # মেসেজ আইডি কনভার্ট করা  
        movie_message_id = int(message.web_app_data.data)  
          
        # চ্যানেল থেকে মুভি কপি করে ইউজারের ইনবক্সে পাঠানো  
        await bot.copy_message(  
            chat_id=user_id,  
            from_chat_id=CHANNEL_ID,  
            message_id=movie_message_id  
        )  
    except Exception as e:  
        await message.answer("দুঃখিত, মুভিটি পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।")  
  
async def main():  
    logging.basicConfig(level=logging.INFO)  
    print("Bot is running...")  
    await dp.start_polling(bot)  
  
if __name__ == "__main__":  
    asyncio.run(main())  
