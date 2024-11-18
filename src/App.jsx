'use client';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Settings, Search, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const DateFilterPopover = ({ onApplyFilter, currentStartDate, currentEndDate }) => {
  const [customStartDate, setCustomStartDate] = useState(currentStartDate);
  const [customEndDate, setCustomEndDate] = useState(currentEndDate);

  const filters = [
    {
      id: 'today',
      label: "Aujourd'hui",
      dates: () => {
        const today = new Date();
        return { start: today, end: today };
      },
    },
    {
      id: 'week',
      label: 'Cette semaine',
      dates: () => {
        const start = new Date();
        start.setDate(start.getDate() - start.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return { start, end };
      },
    },
    {
      id: 'month',
      label: 'Ce mois',
      dates: () => {
        const start = new Date();
        start.setDate(1);
        const end = new Date(start);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        return { start, end };
      },
    },
  ];

  return (
    <div className='w-72 p-2'>
      <div className='space-y-2'>
        {filters.map((filter) => (
          <Button
            key={filter.id}
            variant='ghost'
            className='w-full justify-start font-normal'
            onClick={() => {
              const { start, end } = filter.dates();
              onApplyFilter(start, end);
            }}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className='border-t my-4' />

      <div className='space-y-4'>
        <div className='space-y-2'>
          <span className='text-sm'>À partir de</span>
          <Input type='date' value={customStartDate.toISOString().split('T')[0]} onChange={(e) => setCustomStartDate(new Date(e.target.value))} />
        </div>
        <div className='space-y-2'>
          <span className='text-sm'>au</span>
          <Input type='date' value={customEndDate.toISOString().split('T')[0]} onChange={(e) => setCustomEndDate(new Date(e.target.value))} />
        </div>
        <Button className='w-full bg-teal-600 hover:bg-teal-600/90 text-white' onClick={() => onApplyFilter(customStartDate, customEndDate)}>
          Appliquer
        </Button>
      </div>
    </div>
  );
};

const DynamicCalendar = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [selectedHour, setSelectedHour] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState('Ressource1');
  const [closureStartDate, setClosureStartDate] = useState(new Date());
  const [closureEndDate, setClosureEndDate] = useState(new Date());
  const [closureReason, setClosureReason] = useState('');

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Fonction pour générer tous les jours entre deux dates
  const getDatesInRange = (start, end) => {
    const dates = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const handlePrevious = () => {
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    newStart.setDate(newStart.getDate() - 1);
    newEnd.setDate(newEnd.getDate() - 1);
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const handleNext = () => {
    const newStart = new Date(startDate);
    const newEnd = new Date(endDate);
    newStart.setDate(newStart.getDate() + 1);
    newEnd.setDate(newEnd.getDate() + 1);
    setStartDate(newStart);
    setEndDate(newEnd);
  };

  const handleFilterApply = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleCellClick = (date, hour) => {
    setSelectedHour({ date, hour });
    setIsModalOpen(true);
  };

  const handleClosureModalOpen = () => {
    setIsClosureModalOpen(true);
  };

  const handleClosureModalSubmit = () => {
    // Logique d'enregistrement de la fermeture
    console.log('Nouveau jour de fermeture créé :');
    console.log('Ressource :', selectedResource);
    console.log('Date de début :', closureStartDate);
    console.log('Date de fin :', closureEndDate);
    console.log('Motif :', closureReason);
    setIsClosureModalOpen(false);
  };

  const handleClosureModalCancel = () => {
    setIsClosureModalOpen(false);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const datesInRange = getDatesInRange(startDate, endDate);
  console.log('hours', startDate.getHours());
  console.log('day', startDate.getDate());
  return (
    <div className='w-full bg-white'>
      {/* Header */}
      <div className='flex items-center gap-4 p-2 bg-white border-b'>
        <div className='flex items-center gap-1'>
          <Button variant='ghost' size='icon' onClick={handlePrevious}>
            <ChevronLeft className='w-4 h-4' />
          </Button>
          <Button variant='ghost' size='icon' onClick={handleNext}>
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant='outline' className='min-w-[240px] justify-start'>
              Du : {startDate.toLocaleDateString('fr-FR')} au : {endDate.toLocaleDateString('fr-FR')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='p-0' align='start'>
            <DateFilterPopover onApplyFilter={handleFilterApply} currentStartDate={startDate} currentEndDate={endDate} />
          </PopoverContent>
        </Popover>

        <Button className='bg-teal-600 hover:bg-teal-600/90 text-white' onClick={handleClosureModalOpen}>
          Ajouter des jours de fermeture
        </Button>

        {/* <div className='flex items-center gap-4 ml-auto'>
          <Button variant='ghost' size='icon'>
            <Settings className='w-4 h-4' />
          </Button>
          <Button variant='ghost' size='icon'>
            <Search className='w-4 h-4' />
          </Button>
          <div className='w-8 h-8 bg-teal-600 rounded-full' />
          <Button variant='ghost' size='icon'>
            <Search className='w-4 h-4' />
          </Button>
          <Button variant='ghost' size='icon'>
            <Maximize className='w-4 h-4' />
          </Button>
        </div> */}
      </div>

      {/* Calendar Grid */}
      <div className='w-full overflow-x-auto'>
        <div className='min-w-max'>
          {/* Headers */}
          <div className='flex'>
            <div className='w-48 p-4 font-medium text-gray-600'>Ressources</div>
            <div className='flex-1'>
              <div className='flex'>
                {datesInRange.map((date, index) => (
                  <div key={date.toISOString()} className='flex-1 border-l first:border-l-0'>
                    <div className='text-sm text-gray-600 p-2 text-center border-b'>{formatDate(date)}</div>
                  </div>
                ))}
              </div>
              <div className='flex'>
                {datesInRange.map((date) => (
                  <div key={date.toISOString()} className='flex-1 border-l first:border-l-0'>
                    <div className='flex'>
                      {hours.map((hour) => (
                        <div key={hour} className='text-center border-r p-1 w-12'>
                          <div className='text-xs text-gray-600'>{hour}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resources Row */}
          <div className='flex border-t'>
            <div className='w-48 p-4 text-gray-600'>Fatoum20</div>
            <div className='flex flex-1'>
              {datesInRange.map((date) => (
                <div key={date.toISOString()} className='flex-1 border-l first:border-l-0'>
                  <div className='flex'>
                    {hours.map((hour) => (
                      <div key={hour} onClick={() => handleCellClick(date, hour)} className={cn('w-12 h-12 border-r border-b cursor-pointer transition-colors hover:bg-gray-50', date.getDate() === startDate.getDate() && hour === startDate.getHours() && 'bg-blue-500 hover:bg-blue-500')} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedHour && `${formatDate(selectedHour.date)} - ${selectedHour.hour}h00`}</DialogTitle>
          </DialogHeader>
          <div className='p-4'>
            <p>
              Vous avez sélectionné le créneau de {selectedHour?.hour}h00 le {selectedHour && formatDate(selectedHour.date)}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal d'ajout de jours de fermeture */}
      <Dialog open={isClosureModalOpen} onOpenChange={setIsClosureModalOpen} className='w-full'>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter des jours de fermeture</DialogTitle>
          </DialogHeader>
          <div className='p-4 space-y-4'>
            <span className='text-sm'>Ressource</span>
            <Select label='Ressource' value={selectedResource} onChange={(value) => setSelectedResource(value)}>
              <SelectTrigger className='w-[180px]'>
                <SelectValue placeholder='Sélectionnez une ressource' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value='Ressource1'>Ressource1</SelectItem>
                  <SelectItem value='Ressource2'>Ressource2</SelectItem>
                  <SelectItem value='Ressource3'>Ressource3</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <div>
              <div className='space-y-2'>
                <span className='text-sm'>À partir de</span>
                <Input type='date' value={closureStartDate.toISOString().split('T')[0]} onChange={(e) => setClosureStartDate(new Date(e.target.value))} />
              </div>
              <div className='space-y-2'>
                <span className='text-sm'>au</span>
                <Input type='date' value={closureEndDate.toISOString().split('T')[0]} onChange={(e) => setClosureEndDate(new Date(e.target.value))} />
              </div>
            </div>
            <div className='space-y-2 flex items-center justify-center gap-2'>
              <span className='text-ellipsis font-bold'>Motif</span>
              <Input type='text' placeholder='par ex. Inventaire et valorisation des stocks' value={closureReason} onChange={(e) => setClosureReason(e.target.value)} className='border-0 focus:!ring-transparent' />
            </div>
          </div>
          <DialogFooter>
            <Button className='bg-teal-600 hover:bg-teal-600/90 text-white' onClick={handleClosureModalSubmit}>
              Créer des jours de fermeture
            </Button>

            <Button variant='secondary' onClick={handleClosureModalCancel}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DynamicCalendar;
