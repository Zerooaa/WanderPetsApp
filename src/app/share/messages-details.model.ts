export class MessagesDetails {
  id: number = 0;
  contactMessage: string = "";
  contactName: string = "";
  contactEmail: string = "";
  postMessage: string = "";
  postTag: string = "";
  postLocation: string = "";
  postFilter: string = "";
  userId: string = ""; // Ensure this field is included
  images: File[] = []; // Ensure this field is included for submission
  imageUrl: string | null = null; // This field is used for displaying the image
  postedDate: Date = new Date(); // New field
  username: string = ""; // New field
}
