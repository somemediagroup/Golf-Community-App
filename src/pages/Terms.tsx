import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Scroll, Shield } from "lucide-react";
import { motion } from "framer-motion";

const Terms = () => {
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
            <Scroll className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-3xl font-bold">Terms of Service</h1>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-sm p-6 mb-8">
          <p className="text-muted-foreground mb-6">Last updated: June 15, 2023</p>
          
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h2>1. Introduction</h2>
            <p>
              Welcome to GolfBuddy. These Terms of Service govern your use of our website and 
              mobile application (collectively, the "Service"). By accessing or using the Service, 
              you agree to be bound by these Terms.
            </p>
            
            <h2>2. Definitions</h2>
            <p>
              <strong>"Account"</strong> means a unique account created for you to access our Service.
              <br />
              <strong>"Company"</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) 
              refers to GolfBuddy Inc.
              <br />
              <strong>"Content"</strong> refers to content such as text, images, or other information that can be 
              posted, uploaded, linked to or otherwise made available through the Service.
              <br />
              <strong>"Device"</strong> means any device that can access the Service such as a computer, a 
              cellphone or a digital tablet.
              <br />
              <strong>"User"</strong> (referred to as either "User", "You" or "Your") refers to an individual 
              accessing or using the Service, or the company or other legal entity on behalf of which such 
              individual is accessing or using the Service.
            </p>
            
            <h2>3. Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, complete, 
              and current at all times. Failure to do so constitutes a breach of these Terms, which may 
              result in immediate termination of your account on our Service.
            </p>
            <p>
              You are responsible for safeguarding the password that you use to access the Service and for 
              any activities or actions under your password.
            </p>
            
            <h2>4. Content</h2>
            <p>
              Our Service allows you to post, link, store, share and otherwise make available certain 
              information, text, graphics, videos, or other material. You are responsible for the content 
              that you post on or through the Service, including its legality, reliability, and appropriateness.
            </p>
            <p>
              You retain any and all of your rights to any Content you submit, post or display on or through 
              the Service and you are responsible for protecting those rights.
            </p>
            
            <h2>5. Prohibited Uses</h2>
            <p>
              You may use our Service only for lawful purposes and in accordance with these Terms. You agree 
              not to use the Service:
            </p>
            <ul>
              <li>In any way that violates any applicable national, federal, state, local or international law or regulation.</li>
              <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", 
              "chain letter" or "spam" or any other similar solicitation.</li>
              <li>To impersonate or attempt to impersonate the Company, a Company employee, another user, or any other person or entity.</li>
            </ul>
            
            <h2>6. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for 
              any reason whatsoever, including without limitation if you breach these Terms.
            </p>
            <p>
              Upon termination, your right to use the Service will immediately cease. If you wish to terminate 
              your account, you may simply discontinue using the Service.
            </p>
            
            <h2>7. Limitation of Liability</h2>
            <p>
              In no event shall the Company, nor its directors, employees, partners, agents, suppliers, or 
              affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, 
              including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
              resulting from your access to or use of or inability to access or use the Service.
            </p>
            
            <h2>8. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
              If a revision is material we will try to provide at least 30 days' notice prior to any new 
              terms taking effect.
            </p>
            
            <h2>9. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at <Link to="/contact" className="text-primary hover:underline">support@golfbuddy.com</Link>.
            </p>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <Button variant="outline" asChild>
            <Link to="/privacy">
              <Shield className="h-4 w-4 mr-2" />
              Privacy Policy
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

export default Terms; 