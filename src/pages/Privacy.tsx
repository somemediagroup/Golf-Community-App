import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Scroll } from "lucide-react";
import { motion } from "framer-motion";

const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center mb-8">
          <Button variant="ghost" size="icon" asChild className="mr-4">
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
          <p className="text-muted-foreground mb-6">Last updated: June 15, 2023</p>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>
              GolfBuddy ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our 
              website and mobile application (collectively, the "Service").
            </p>
            <p>
              Please read this Privacy Policy carefully. By accessing or using the Service, you acknowledge 
              that you have read, understood, and agree to be bound by all the terms of this Privacy Policy.
            </p>
            
            <h2>2. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when you:
            </p>
            <ul>
              <li>Register for an account</li>
              <li>Fill out a form</li>
              <li>Update your profile information</li>
              <li>Participate in community discussions</li>
              <li>Contact customer support</li>
              <li>Interact with other features of the Service</li>
            </ul>
            <p>
              The types of information we may collect include:
            </p>
            <ul>
              <li>Personal identifiers (name, email address, username)</li>
              <li>Profile information (profile picture, biography, location, handicap)</li>
              <li>Content you post (messages, comments, reviews)</li>
              <li>Golf-related information (scores, courses played, statistics)</li>
              <li>Technical data (IP address, device information, browser type)</li>
              <li>Usage information (how you interact with our Service)</li>
            </ul>
            
            <h2>3. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul>
              <li>Provide, maintain, and improve our Service</li>
              <li>Process transactions and send related information</li>
              <li>Create and maintain your account</li>
              <li>Send administrative information, such as updates or security alerts</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Personalize your experience and deliver content relevant to your interests</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our Service</li>
              <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
            </ul>
            
            <h2>4. Sharing of Your Information</h2>
            <p>
              We may share your information with:
            </p>
            <ul>
              <li>Other users (according to your privacy settings)</li>
              <li>Service providers who perform services on our behalf</li>
              <li>Law enforcement or other parties if required by law or if we believe in good faith that disclosure is necessary</li>
              <li>Any entities in the event of a merger, sale, or other corporate transaction</li>
            </ul>
            
            <h2>5. Your Choices</h2>
            <p>
              You can control your information through:
            </p>
            <ul>
              <li>Account Settings: You can update or correct your account information at any time by logging into your account.</li>
              <li>Privacy Controls: You can set or modify your privacy preferences to control who can see your profile and activity.</li>
              <li>Marketing Communications: You can opt out of receiving promotional emails by following the instructions in those emails.</li>
              <li>Data Removal: You can request complete removal of your data by visiting our <Link to="/data-removal" className="text-primary hover:underline">Data Removal Request</Link> page.</li>
            </ul>
            
            <h2>6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect the security of your 
              personal information. However, please be aware that no method of transmission over the Internet 
              or method of electronic storage is 100% secure.
            </p>
            
            <h2>7. Children's Privacy</h2>
            <p>
              Our Service is not directed to children under the age of 13, and we do not knowingly collect 
              personal information from children under 13. If you are a parent or guardian and you are aware 
              that your child has provided us with personal information, please contact us.
            </p>
            
            <h2>8. International Data Transfers</h2>
            <p>
              Your information may be transferred to, and maintained on, computers located outside of your 
              state, province, country, or other governmental jurisdiction where the data protection laws 
              may differ from those of your jurisdiction.
            </p>
            
            <h2>9. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the "Last Updated" date.
            </p>
            
            <h2>10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <Link to="/contact" className="text-primary hover:underline">privacy@golfbuddy.com</Link>.
            </p>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Button variant="outline" asChild>
            <Link to="/terms">
              <Scroll className="h-4 w-4 mr-2" />
              Terms of Service
            </Link>
          </Button>
          
          <Button asChild>
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Privacy; 