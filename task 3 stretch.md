* How you would go about implementing the solution
    - The current solution includes having an array attached to messages, tags would then be appended or overwriten.
    - To be able to do this required a reading of the codebase to try to understand how the methods operated and were connected to each other.
    - I'd say the primary changes I made were within the "messages" directory, refactoring code to add an optional "tags" property to ".model.ts" and ".entity.ts". Afterwards, I implemented methods to add/update tags as well as search said tags.
    - Next, I implemented some basic unit tests to check the correctness of all the changes made.
* What problems you might encounter
    - My biggest gripe was my understanding of the codebase and trying to figure how everything was connected, especially when involving the data transfer object files.
    - My unfamiliarity with jest was did hinder my progress a bit, but after understanding some of the prewritten tests in "message.data.spec.ts", I was able to implement some basic unit tests.
    - One theoretical issue is the possibility of mutiple tags being added to a message, which can lead to database performance issues for large tag arrays. A user could also add tags to a message they're not authorised to access, which is not secure.
* How you would go about testing
    - I have created unit tests in "message.data.spec.ts" for the implemented tag methods to verify that they save tag modifications effectively and that the query can fetch documents with the designated tags.
* What you might do differently
    - Having a better walkthrough of the DTOs and DAOs to understand how they are used in the code, as I believe they can be used in more effective implementations of tag creation and modification in messages.
    - Adding authentication in the unit tests to ensure authorised users are allowed perform certain actions for tags.
