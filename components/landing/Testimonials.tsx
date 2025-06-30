import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Marie Dubois',
    role: 'Community Manager',
    content: 'SalesXMarketing a révolutionné la gestion de mes jeux concours ! Chaque participant reçoit automatiquement un message personnalisé.',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    rating: 5,
  },
  {
    name: 'Thomas Martin',
    role: 'Responsable Marketing Digital',
    content: 'L\'engagement de notre communauté a augmenté de 300% depuis qu\'on utilise les workflows automatisés de SalesXMarketing.',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    rating: 5,
  },
  {
    name: 'Sophie Laurent',
    role: 'Influenceuse Lifestyle',
    content: 'Parfait pour gérer mes collaborations ! Je peux maintenant envoyer des messages personnalisés à tous mes followers engagés.',
    avatar: 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    rating: 5,
  },
  {
    name: 'Alexandre Petit',
    role: 'Directeur d\'Agence',
    content: 'Nos clients adorent les résultats ! L\'engagement authentique avec leur communauté existante fait toute la différence.',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    rating: 5,
  },
  {
    name: 'Camille Rousseau',
    role: 'Brand Manager',
    content: 'La vérification automatique des followers nous évite les erreurs. Plus de messages envoyés à des non-followers !',
    avatar: 'https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    rating: 5,
  },
  {
    name: 'Nicolas Moreau',
    role: 'E-commerce Manager',
    content: 'Les workflows déclenchés par URL sont géniaux ! Un post, une URL, et tout se lance automatiquement.',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ce que disent nos 
            <span className="text-gradient"> community managers</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Rejoignez des milliers de professionnels qui ont transformé leur engagement 
            communautaire grâce à SalesXMarketing.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="card-hover bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current text-yellow-500" />
                  ))}
                </div>
                
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}