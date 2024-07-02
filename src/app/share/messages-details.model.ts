export class MessagesDetails {
  id: number = 0;
  postMessage: string = "";
  postTag: string = "";
  postLocation: string = "";
  postFilter: string = "";
  userId: string = ""; // Ensure this field is included
  images: File[] = []; // Ensure this field is included for submission
  imageUrl: string | null = null; // This field is used for displaying the image
  imageUrls: string[] = []; // New field for image URLs
  postedDate: Date = new Date(); // New field
  username: string = ""; // New field
  adopted: boolean = false; // New field to track adoption status
}
