import json
import psycopg2

# Assuming you have a JSON file with your general notes
json_file_path = '../user_data/markusromaniw@gmx.de/general_notes.json'

# Function to load JSON data from a file
def load_json_data(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    return data

# Function to insert general notes into the database
def insert_general_notes(cursor, notes_data, user_id):
    for date, content in notes_data.items():
        # Convert date to the beginning of the day for consistency
        date_beginning = f"{date} 00:00:00"

        try:
            # First, attempt to update any existing note for the user and date
            cursor.execute("""
                UPDATE generalnotes 
                SET Content = %s, Updated_At = NOW()
                WHERE UserID = %s AND DATE(Created_At) = DATE(TO_TIMESTAMP(%s, 'YYYY-MM-DD HH24:MI:SS'))
                RETURNING NoteID;
                """, (content, user_id, date_beginning))

            # If no row was updated, insert the new note
            if cursor.rowcount == 0:
                cursor.execute("""
                    INSERT INTO generalnotes (UserID, Content, Created_At, Updated_At) 
                    VALUES (%s, %s, TO_TIMESTAMP(%s, 'YYYY-MM-DD HH24:MI:SS'), NOW());
                    """, (user_id, content, date_beginning))
                print(f"Inserted new note for date {date}")
            else:
                print(f"Updated existing note for date {date}")

        except psycopg2.Error as e:
            print(f"Error inserting/updating note for date {date}: {e}")
            continue



def main():
    # Load the JSON data
    notes_data = load_json_data(json_file_path)
    
    # Database connection parameters - replace with your details
    conn = psycopg2.connect(
        dbname="db-1",
        user="dbadmin",
        password="",
        host="35.198.153.152"
    )
    cursor = conn.cursor()
    
    # Insert the general notes data
    insert_general_notes(cursor, notes_data, 8)
    
    # Commit the transactions and close the connection
    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
