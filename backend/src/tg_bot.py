import httpx
import os

# --- Telegram Bot ---
async def send_telegram_notification(order_details: dict):
    TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
    TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("Telegram bot token or chat ID is not set. Skipping notification.")
        return

    # --- Message Formatting ---
    nova_poshta_details = ""
    if order_details.get("novaPoshta"):
        nova_poshta_info = order_details["novaPoshta"]
        if nova_poshta_info:
            nova_poshta_details = (
                f"<b>Nova Poshta Details:</b>\n"
                f"City: {nova_poshta_info.get('city', 'N/A')}\n"
                f"Warehouse: {nova_poshta_info.get('warehouse', 'N/A')}\n\n"
            )

    items_details = "<b>Ordered Items:</b>\n"
    if order_details.get("items"):
        for item in order_details["items"]:
            name = item.get('name', 'N/A')
            quantity = item.get('quantity', 'N/A')
            size = item.get('size', '')
            size_str = f" (Size: {size})" if size else ""
            items_details += f"- {name}{size_str} (Quantity: {quantity})\n"

    message = (
        f"<b>New Order Received!</b>\n"
        f"<b>Order ID:</b> {order_details['id']}\n"
        f"<b>Email:</b> {order_details['email']}\n"
        f"<b>Name:</b> {order_details['firstName']} {order_details['lastName']}\n"
        f"<b>Phone:</b> {order_details['phone']}\n"
        f"<b>Messenger:</b> {order_details.get('messenger', 'N/A')}\n"
        f"<b>Delivery Method:</b> {order_details['deliveryMethod']}\n"
        f"<b>Payment Method:</b> {order_details['paymentMethod']}\n\n"
        f"{nova_poshta_details}"
        f"{items_details}"
    )

    # --- Send Message ---
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    params = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message,
        "parse_mode": "HTML"
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=params)
            response.raise_for_status()
            print("Telegram notification sent successfully.")
        except httpx.HTTPStatusError as e:
            print(f"Failed to send Telegram notification: {e.response.text}")
        except Exception as e:
            print(f"An error occurred while sending Telegram notification: {e}")