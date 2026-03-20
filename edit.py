split_texts = splitter.split_text(question)
embedded_question = embedding_model.encode(split_texts)

conn = get_db_connection()
cur = conn.cursor()
cur.execute("SELECT id FROM pdfs WHERE session_id = %s",(session_id))

cur.execute("" \
"SELECT text, page_number 
FROM chunks 
WHERE pdf_id = %s
ORDER BY embedding <=> %s
LIMIT 5")

context = ""
for text in feteched_chunks:
    context = context + " " + text

message = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=10000,
        system="You are a helpful assistant. Answer questions only based on the conext provided. If the answer is not in the context, say so.",
        messages=[
            {
                'role':'user',
                'content': context"
            }
        ]
    ) 
answer = message.content   