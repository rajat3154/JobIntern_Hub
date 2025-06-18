import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/test";

const dropIndex = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        // Get the conversations collection
        const collection = mongoose.connection.collection('conversations');
        
        // Drop all indexes
        await collection.dropIndexes();
        console.log("Successfully dropped all indexes from conversations collection");

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    } catch (error) {
        console.error("Error:", error);
    }
};

// Run the function
dropIndex(); 