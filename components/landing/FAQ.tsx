import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Comment fonctionne la vérification des followers ?',
    answer: 'Notre système vérifie automatiquement si un utilisateur vous suit avant d\'envoyer un message direct. Cela garantit que vous respectez les bonnes pratiques Instagram et que vos messages sont envoyés uniquement à votre communauté engagée.',
  },
  {
    question: 'Puis-je automatiser mes jeux concours Instagram ?',
    answer: 'Absolument ! Vous pouvez créer des workflows qui envoient automatiquement des messages de confirmation aux participants qui interagissent avec vos posts de jeux concours. Parfait pour confirmer les participations et envoyer des instructions.',
  },
  {
    question: 'Comment fonctionne le déclenchement par URL de post ?',
    answer: 'Il suffit d\'entrer l\'URL d\'un post Instagram dans notre interface pour lancer un workflow d\'engagement. Le système identifiera automatiquement les utilisateurs qui interagissent avec ce post et leur enverra des messages personnalisés.',
  },
  {
    question: 'Quels formats de fichiers CSV sont supportés ?',
    answer: 'Nous supportons les fichiers CSV standard avec au minimum la colonne "account" (nom d\'utilisateur Instagram). Vous pouvez ajouter d\'autres colonnes comme "firstName", "lastName" pour personnaliser vos messages.',
  },
  {
    question: 'L\'application respecte-t-elle les limitations de l\'API Meta ?',
    answer: 'Oui, notre approche est entièrement conforme aux limitations de l\'API Meta. Nous nous concentrons uniquement sur l\'engagement avec vos followers existants et les utilisateurs qui interagissent déjà avec vos contenus.',
  },
  {
    question: 'Puis-je personnaliser les messages envoyés ?',
    answer: 'Bien sûr ! Vous pouvez créer des templates de messages avec des variables personnalisées comme {prenom}, {nom}, etc. Le système remplacera automatiquement ces variables par les données de vos utilisateurs.',
  },
  {
    question: 'Y a-t-il des limites sur le nombre de messages envoyés ?',
    answer: 'Nous respectons les limites d\'Instagram pour éviter tout problème avec votre compte. Les messages sont envoyés de manière progressive et naturelle pour maintenir un engagement authentique.',
  },
  {
    question: 'Comment puis-je suivre les performances de mes campagnes ?',
    answer: 'Notre tableau de bord fournit des analyses détaillées sur vos campagnes d\'engagement : taux de réponse, nombre de messages envoyés, engagement généré, et bien plus encore.',
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Questions 
            <span className="text-gradient"> Fréquentes</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Trouvez rapidement les réponses aux questions les plus courantes 
            sur l'engagement de votre communauté Instagram existante.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}